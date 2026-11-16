import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UsersController from '../../src/controllers/users.js';

// Testes unitarios: o acesso a dados (UsersDataAccess) e substituido por um mock,
// sem Express, sem banco e sem rede.
let controller;
let usersDataAccessMock;

beforeEach(() => {
    usersDataAccessMock = {
        getUser: test.mock.fn(async () => []),
        deleteUser: test.mock.fn(async () => null),
        updateUser: test.mock.fn(async () => null)
    };

    controller = new UsersController();
    controller.usersDataAccess = usersDataAccessMock;
});

test('deveRetornar200ComListaDeUsuariosQuandoAcessoADadosResponde', async () => {
    // Arrange
    const users = [{ _id: '1', email: 'a@test.com' }, { _id: '2', email: 'b@test.com' }];
    usersDataAccessMock.getUser.mock.mockImplementation(async () => users);

    // Act
    const result = await controller.getUsers();

    // Assert
    assert.deepEqual(result, { success: true, statusCode: 200, body: users });
    assert.equal(usersDataAccessMock.getUser.mock.callCount(), 1);
});

test('deveRetornar200ComListaVaziaQuandoNaoHaUsuarios', async () => {
    // Act
    const result = await controller.getUsers();

    // Assert
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, []);
});

test('deveRetornar500QuandoAcessoADadosFalhaAoListar', async () => {
    // Arrange
    const error = new Error('banco indisponivel');
    usersDataAccessMock.getUser.mock.mockImplementation(async () => {
        throw error;
    });

    // Act
    const result = await controller.getUsers();

    // Assert
    assert.deepEqual(result, { success: false, statusCode: 500, body: error });
});

test('deveRepassarIdEDevolver200QuandoRemoveUsuario', async () => {
    // Arrange
    const deleted = { _id: 'abc', email: 'a@test.com' };
    usersDataAccessMock.deleteUser.mock.mockImplementation(async () => deleted);

    // Act
    const result = await controller.deleteUser('abc');

    // Assert
    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, deleted);
    assert.equal(usersDataAccessMock.deleteUser.mock.callCount(), 1);
    assert.deepEqual(usersDataAccessMock.deleteUser.mock.calls[0].arguments, ['abc']);
});

test('deveRetornar500QuandoRemocaoFalhaPorIdInvalido', async () => {
    // Arrange
    usersDataAccessMock.deleteUser.mock.mockImplementation(async () => {
        throw new Error('input must be a 24 character hex string');
    });

    // Act
    const result = await controller.deleteUser('id-invalido');

    // Assert
    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
});

test('deveRepassarIdEDadosERetornar200QuandoAtualizaUsuario', async () => {
    // Arrange
    const data = { email: 'novo@test.com' };

    // Act
    const result = await controller.updateUser('abc', data);

    // Assert
    assert.equal(result.statusCode, 200);
    assert.deepEqual(usersDataAccessMock.updateUser.mock.calls[0].arguments, ['abc', data]);
    assert.equal(usersDataAccessMock.deleteUser.mock.callCount(), 0);
});

test('deveRetornar500QuandoAtualizacaoFalha', async () => {
    // Arrange
    usersDataAccessMock.updateUser.mock.mockImplementation(async () => {
        throw new Error('falha ao atualizar');
    });

    // Act
    const result = await controller.updateUser('abc', { email: 'x@test.com' });

    // Assert
    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
});
