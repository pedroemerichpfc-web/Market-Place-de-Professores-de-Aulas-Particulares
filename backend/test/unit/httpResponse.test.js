import test from 'node:test';
import assert from 'node:assert/strict';
import { ok, notFound, serverError } from '../../src/helpers/httpResponse.js';

test('ok retorna sucesso com status 200 e o corpo informado', () => {
    const body = { id: 1, email: 'aluno@test.com' };

    assert.deepEqual(ok(body), { success: true, statusCode: 200, body });
});

test('ok aceita corpo vazio (null) sem alterar o formato', () => {
    assert.deepEqual(ok(null), { success: true, statusCode: 200, body: null });
});

test('notFound retorna falha com mensagem Not found', () => {
    const result = notFound();

    assert.equal(result.success, false);
    assert.equal(result.statusCode, 400);
    assert.equal(result.body, 'Not found');
});

test('serverError retorna falha com status 500 e o erro original', () => {
    const error = new Error('falha no banco');
    const result = serverError(error);

    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
    assert.equal(result.body, error);
});
