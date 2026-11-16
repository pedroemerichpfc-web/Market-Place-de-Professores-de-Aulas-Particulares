import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { Mongo } from '../../src/database/mongo.js';
import UsersDataAccess from '../../src/dataAccess/users.js';

// Testes unitarios: Mongo.db e substituido por uma colecao mockada,
// sem conexao com banco real.
const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';
const INVALID_ID_MESSAGE = /input must be a 24 character hex string/;
let collectionMock;
let collectionNames;
let dataAccess;

beforeEach(() => {
    collectionNames = [];
    collectionMock = {
        find: test.mock.fn(() => ({ toArray: async () => [{ email: 'a@test.com' }] })),
        findOneAndDelete: test.mock.fn(async () => ({ email: 'a@test.com' })),
        findOneAndUpdate: test.mock.fn(async () => ({ email: 'novo@test.com' }))
    };
    Mongo.db = {
        collection: (name) => {
            collectionNames.push(name);
            return collectionMock;
        }
    };
    dataAccess = new UsersDataAccess();
});

afterEach(() => {
    Mongo.db = undefined;
});

test('deveListarTodosOsUsuariosDaColecaoUsersSemFiltro', async () => {
    // Act
    const result = await dataAccess.getUser();

    // Assert
    assert.deepEqual(result, [{ email: 'a@test.com' }]);
    assert.deepEqual(collectionNames, ['users']);
    assert.deepEqual(collectionMock.find.mock.calls[0].arguments, [{}]);
});

test('deveConverterIdEmObjectIdAntesDeRemover', async () => {
    // Act
    const result = await dataAccess.deleteUser(VALID_ID);

    // Assert
    const [filter] = collectionMock.findOneAndDelete.mock.calls[0].arguments;
    assert.ok(filter._id instanceof ObjectId);
    assert.equal(filter._id.toString(), VALID_ID);
    assert.deepEqual(result, { email: 'a@test.com' });
});

test('deveLancarBSONErrorENaoRemoverQuandoIdEInvalido', async () => {
    // Act + Assert (tipo e mensagem da excecao)
    await assert.rejects(
        () => dataAccess.deleteUser('id-invalido'),
        { name: 'BSONError', message: INVALID_ID_MESSAGE }
    );
    assert.equal(collectionMock.findOneAndDelete.mock.callCount(), 0);
});

// Teste parametrizado: ids na fronteira do formato aceito pelo ObjectId (24 caracteres hexadecimais)
const idsNaFronteira = [
    { id: '', valido: false, descricao: 'vazio' },
    { id: '64b7f0c2a1b2c3d4e5f6071', valido: false, descricao: '23 caracteres' },
    { id: '64b7f0c2a1b2c3d4e5f607181', valido: false, descricao: '25 caracteres' },
    { id: 'zzzzzzzzzzzzzzzzzzzzzzzz', valido: false, descricao: '24 caracteres nao hexadecimais' },
    { id: '64B7F0C2A1B2C3D4E5F60718', valido: true, descricao: '24 caracteres hexadecimais maiusculos' }
];

for (const { id, valido, descricao } of idsNaFronteira) {
    test(`deveValidarIdNaFronteiraAntesDeRemover - id ${descricao} ${valido ? 'aceito' : 'rejeitado'}`, async () => {
        if (valido) {
            // Act
            await dataAccess.deleteUser(id);

            // Assert
            assert.equal(collectionMock.findOneAndDelete.mock.callCount(), 1);
        } else {
            // Act + Assert
            await assert.rejects(() => dataAccess.deleteUser(id), { name: 'BSONError' });
            assert.equal(collectionMock.findOneAndDelete.mock.callCount(), 0);
        }
    });
}

test('deveAtualizarApenasOsCamposEnviadosQuandoNaoHaSenha', async () => {
    // Act
    const result = await dataAccess.updateUser(VALID_ID, { email: 'novo@test.com' });

    // Assert
    const [filter, update] = collectionMock.findOneAndUpdate.mock.calls[0].arguments;
    assert.equal(filter._id.toString(), VALID_ID);
    assert.deepEqual(update, { $set: { email: 'novo@test.com' } });
    assert.deepEqual(result, { email: 'novo@test.com' });
});

test('deveGravarHashESaltNuncaASenhaEmTextoPuroQuandoAtualizaSenha', async () => {
    // Arrange
    const novaSenha = 'novaSenha123';

    // Act
    await dataAccess.updateUser(VALID_ID, { password: novaSenha });

    // Assert
    assert.equal(collectionMock.findOneAndUpdate.mock.callCount(), 1);
    const [, update] = collectionMock.findOneAndUpdate.mock.calls[0].arguments;
    assert.ok(Buffer.isBuffer(update.$set.password));
    assert.equal(update.$set.password.length, 16);
    assert.ok(Buffer.isBuffer(update.$set.salt));
    assert.notEqual(update.$set.password.toString(), novaSenha);
});

test('deveLancarErroDeHashENaoAtualizarQuandoSenhaNaoETexto', async () => {
    // Act + Assert (tipo e mensagem da excecao)
    await assert.rejects(
        () => dataAccess.updateUser(VALID_ID, { password: 12345 }),
        { name: 'Error', message: 'Error during hashing password!' }
    );
    assert.equal(collectionMock.findOneAndUpdate.mock.callCount(), 0);
});
