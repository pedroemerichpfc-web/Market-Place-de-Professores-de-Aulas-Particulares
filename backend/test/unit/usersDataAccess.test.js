import test, { beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { Mongo } from '../../src/database/mongo.js';
import UsersDataAccess from '../../src/dataAccess/users.js';

// Testes unitarios: Mongo.db e substituido por uma colecao falsa em memoria,
// sem conexao com banco real.
const VALID_ID = '64b7f0c2a1b2c3d4e5f60718';
let collection;
let collectionNames;
let dataAccess;

beforeEach(() => {
    collectionNames = [];
    collection = {
        find: test.mock.fn(() => ({ toArray: async () => [{ email: 'a@test.com' }] })),
        findOneAndDelete: test.mock.fn(async () => ({ email: 'a@test.com' })),
        findOneAndUpdate: test.mock.fn(async () => ({ email: 'novo@test.com' }))
    };
    Mongo.db = {
        collection: (name) => {
            collectionNames.push(name);
            return collection;
        }
    };
    dataAccess = new UsersDataAccess();
});

afterEach(() => {
    Mongo.db = undefined;
});

test('getUser consulta a colecao users sem filtro e retorna o array', async () => {
    const result = await dataAccess.getUser();

    assert.deepEqual(result, [{ email: 'a@test.com' }]);
    assert.deepEqual(collectionNames, ['users']);
    assert.deepEqual(collection.find.mock.calls[0].arguments, [{}]);
});

test('deleteUser converte o id em ObjectId antes de remover', async () => {
    const result = await dataAccess.deleteUser(VALID_ID);

    const [filter] = collection.findOneAndDelete.mock.calls[0].arguments;
    assert.ok(filter._id instanceof ObjectId);
    assert.equal(filter._id.toString(), VALID_ID);
    assert.deepEqual(result, { email: 'a@test.com' });
});

test('deleteUser lanca erro para id em formato invalido', async () => {
    await assert.rejects(() => dataAccess.deleteUser('id-invalido'));
    assert.equal(collection.findOneAndDelete.mock.callCount(), 0);
});

test('updateUser sem senha atualiza apenas os campos enviados', async () => {
    const result = await dataAccess.updateUser(VALID_ID, { email: 'novo@test.com' });

    const [filter, update] = collection.findOneAndUpdate.mock.calls[0].arguments;
    assert.equal(filter._id.toString(), VALID_ID);
    assert.deepEqual(update, { $set: { email: 'novo@test.com' } });
    assert.deepEqual(result, { email: 'novo@test.com' });
});

test('Mongo.connect retorna objeto de erro para string de conexao invalida', async () => {
    const result = await Mongo.connect({ mongoConnectionString: 'conexao-invalida', mongoDbName: 'test' });

    assert.equal(result.text, 'Error during mongo connection');
    assert.ok(result.error instanceof Error);
});
