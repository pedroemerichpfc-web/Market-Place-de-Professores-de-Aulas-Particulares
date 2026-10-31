import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { start, stop, clearUsers, request, signup } from './testServer.js';

let base;

before(async () => {
    base = await start();
});

after(async () => {
    await stop();
});

beforeEach(async () => {
    await clearUsers();
});

async function createUser() {
    const email = `user_${randomUUID()}@test.com`;
    await signup(base, email, 'senha123');

    const { data } = await request(base, 'GET', '/users');
    const created = data.body.find((user) => user.email === email);

    return { email, id: created._id };
}

test('GET / retorna 200 com mensagem Hello World', async () => {
    const { response, data } = await request(base, 'GET', '/');

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.body, 'Hello World');
});

test('GET /users retorna 200 com a lista de usuarios', async () => {
    const { email } = await createUser();

    const { response, data } = await request(base, 'GET', '/users');

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.body));
    assert.ok(data.body.some((user) => user.email === email));
});

test('GET /users responde com content-type application/json', async () => {
    const { response } = await request(base, 'GET', '/users');

    assert.match(response.headers.get('content-type'), /application\/json/);
});

test('PUT /users/:id atualiza um usuario e retorna 200', async () => {
    const { id } = await createUser();
    const novoEmail = `updated_${randomUUID()}@test.com`;

    const { response, data } = await request(base, 'PUT', `/users/${id}`, { email: novoEmail });

    assert.equal(response.status, 200);
    assert.equal(data.success, true);

    const { data: lista } = await request(base, 'GET', '/users');
    assert.ok(lista.body.some((user) => user.email === novoEmail));
});

test('PUT /users/:id com id invalido retorna 500', async () => {
    const { response, data } = await request(base, 'PUT', '/users/id-invalido', { email: 'x@test.com' });

    assert.equal(response.status, 500);
    assert.equal(data.success, false);
});

test('DELETE /users/:id remove um usuario e retorna 200', async () => {
    const { id, email } = await createUser();

    const { response, data } = await request(base, 'DELETE', `/users/${id}`);

    assert.equal(response.status, 200);
    assert.equal(data.success, true);

    const { data: lista } = await request(base, 'GET', '/users');
    assert.ok(!lista.body.some((user) => user.email === email));
});

test('DELETE /users/:id com id invalido retorna 500', async () => {
    const { response, data } = await request(base, 'DELETE', '/users/id-invalido');

    assert.equal(response.status, 500);
    assert.equal(data.success, false);
});

test('DELETE /users/:id com id inexistente retorna 200 com body nulo', async () => {
    const { response, data } = await request(base, 'DELETE', '/users/000000000000000000000000');

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.body, null);
});

test('fluxo cadastro e remocao cruzando /auth e /users', async () => {
    const email = `fluxo_${randomUUID()}@test.com`;
    await signup(base, email, 'senha123');

    const { data: aposCadastro } = await request(base, 'GET', '/users');
    const criado = aposCadastro.body.find((user) => user.email === email);
    assert.ok(criado);

    const { response: respDelete } = await request(base, 'DELETE', `/users/${criado._id}`);
    assert.equal(respDelete.status, 200);

    const { data: aposRemocao } = await request(base, 'GET', '/users');
    assert.ok(!aposRemocao.body.some((user) => user.email === email));
});
