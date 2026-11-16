import test from 'node:test';
import assert from 'node:assert/strict';
import { ok, notFound, serverError } from '../../src/helpers/httpResponse.js';

test('deveRetornarSucessoCom200QuandoOkRecebeUmCorpo', () => {
    // Arrange
    const body = { id: 1, email: 'aluno@test.com' };

    // Act
    const result = ok(body);

    // Assert
    assert.deepEqual(result, { success: true, statusCode: 200, body });
});

test('deveManterFormatoDeSucessoQuandoOkRecebeCorpoNulo', () => {
    // Act
    const result = ok(null);

    // Assert
    assert.deepEqual(result, { success: true, statusCode: 200, body: null });
});

test('deveRetornarFalhaComMensagemNotFoundQuandoRecursoNaoExiste', () => {
    // Act
    const result = notFound();

    // Assert
    assert.deepEqual(result, { success: false, statusCode: 400, body: 'Not found' });
});

test('deveRetornar500ComErroOriginalQuandoServerError', () => {
    // Arrange
    const error = new Error('falha no banco');

    // Act
    const result = serverError(error);

    // Assert
    assert.equal(result.success, false);
    assert.equal(result.statusCode, 500);
    assert.equal(result.body, error);
});
