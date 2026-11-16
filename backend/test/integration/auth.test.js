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

test('POST /auth/signup cadastra usuario e retorna 200 com token', async () => {
    const email = `signup_${randomUUID()}@test.com`;

    const { response, data } = await signup(base, email, 'senha123');

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.body.text, 'User registered correctly!');
    assert.equal(data.body.logged, true);
    assert.equal(data.body.user.email, email);
    assert.ok(data.body.token);
});

test('POST /auth/signup com email ja cadastrado retorna 500', async () => {
    const email = `dup_${randomUUID()}@test.com`;
    await signup(base, email, 'senha123');

    const { response, data } = await signup(base, email, 'outrasenha');

    assert.equal(response.status, 500);
    assert.equal(data.success, false);
    assert.equal(data.body.text, 'User already exists!');
});

test('POST /auth/login com credenciais validas retorna 200 com token', async () => {
    const email = `login_${randomUUID()}@test.com`;
    await signup(base, email, 'senha123');

    const { response, data } = await request(base, 'POST', '/auth/login', { email, password: 'senha123' });

    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.body.text, 'User logged correctly!');
    assert.equal(data.body.user.email, email);
    assert.ok(data.body.token);
});

test('POST /auth/login com senha incorreta retorna 400', async () => {
    const email = `wrongpass_${randomUUID()}@test.com`;
    await signup(base, email, 'senha123');

    const { response, data } = await request(base, 'POST', '/auth/login', { email, password: 'senhaErrada' });

    assert.equal(response.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.body.text, 'Credentials are not correct!');
});

test('POST /auth/login com email inexistente retorna 400', async () => {
    const { response, data } = await request(base, 'POST', '/auth/login', {
        email: `naoexiste_${randomUUID()}@test.com`,
        password: 'senha123'
    });

    assert.equal(response.status, 400);
    assert.equal(data.success, false);
    assert.equal(data.body.text, 'Credentials are not correct!');
});
