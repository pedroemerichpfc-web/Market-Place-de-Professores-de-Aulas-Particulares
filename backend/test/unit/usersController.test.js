import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import UsersController from '../../src/controllers/users.js';

// Testes unitarios: o acesso a dados e substituido por um dublê (fake),
// sem Express, sem banco e sem rede.
let controller;
let fakeDataAccess;

beforeEach(() => {
    fakeDataAccess = {
        getUser: test.mock.fn(async () => []),
        deleteUser: test.mock.fn(async () => null),
        updateUser: test.mock.fn(async () => null)
    };

    controller = new UsersController();
    controller.usersDataAccess = fakeDataAccess;
});

test('getUsers retorna 200 com a lista vinda do acesso a dados', async () => {
    const users = [{ _id: '1', email: 'a@test.com' }, { _id: '2', email: 'b@test.com' }];
    fakeDataAccess.getUser.mock.mockImplementation(async () => users);

    const result = await controller.getUsers();

    assert.deepEqual(result, { success: true, statusCode: 200, body: users });
    assert.equal(fakeDataAccess.getUser.mock.callCount(), 1);
});

test('getUsers retorna 200 com lista vazia quando nao ha usuarios', async () => {
    const result = await controller.getUsers();

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, []);
});

test('getUsers retorna 500 quando o acesso a dados falha', async () => {
    const error = new Error('banco indisponivel');
    fakeDataAccess.getUser.mock.mockImplementation(async () => {
        throw error;
    });

    const result = await controller.getUsers();

    assert.deepEqual(result, { success: false, statusCode: 500, body: error });
});

test('deleteUser repassa o id e retorna 200 com o resultado', async () => {
    const deleted = { _id: 'abc', email: 'a@test.com' };
    fakeDataAccess.deleteUser.mock.mockImplementation(async () => deleted);

    const result = await controller.deleteUser('abc');

    assert.equal(result.statusCode, 200);
    assert.deepEqual(result.body, deleted);
    assert.deepEqual(fakeDataAccess.deleteUser.mock.calls[0].arguments, ['abc']);
});

test('deleteUser retorna 500 quando o id e invalido', async () => {
    fakeDataAccess.deleteUser.mock.mockImplementation(async () => {
        throw new Error('input must be a 24 character hex string');
    });

    const result = await controller.deleteUser('id-invalido');

    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
});

test('updateUser repassa id e dados e retorna 200', async () => {
    const data = { email: 'novo@test.com' };

    const result = await controller.updateUser('abc', data);

    assert.equal(result.statusCode, 200);
    assert.deepEqual(fakeDataAccess.updateUser.mock.calls[0].arguments, ['abc', data]);
});

test('updateUser retorna 500 quando o acesso a dados falha', async () => {
    fakeDataAccess.updateUser.mock.mockImplementation(async () => {
        throw new Error('falha ao atualizar');
    });

    const result = await controller.updateUser('abc', { email: 'x@test.com' });

    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
});
