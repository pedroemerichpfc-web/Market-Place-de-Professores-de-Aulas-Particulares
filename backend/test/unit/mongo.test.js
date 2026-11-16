import test from 'node:test';
import assert from 'node:assert/strict';
import { Mongo } from '../../src/database/mongo.js';

// Testes unitarios do conector: so cenarios que falham antes de abrir conexao (sem rede).
test('deveRetornarObjetoDeErroQuandoStringDeConexaoTemEsquemaInvalido', async () => {
    // Act
    const result = await Mongo.connect({ mongoConnectionString: 'conexao-invalida', mongoDbName: 'test' });

    // Assert
    assert.equal(result.text, 'Error during mongo connection');
    assert.equal(result.error.name, 'MongoParseError');
});

test('deveRetornarObjetoDeErroQuandoStringDeConexaoEVazia', async () => {
    // Act
    const result = await Mongo.connect({ mongoConnectionString: '', mongoDbName: 'test' });

    // Assert
    assert.equal(result.text, 'Error during mongo connection');
    assert.match(result.error.message, /Invalid scheme/);
});
