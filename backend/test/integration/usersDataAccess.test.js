import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongo } from '../../src/database/mongo.js';
import UsersDataAccess from '../../src/dataAccess/users.js';

// Integracao da camada de acesso a dados com um MongoDB real e descartavel (mongodb-memory-server).
let mongod;
const dataAccess = new UsersDataAccess();

before(async () => {
    mongod = await MongoMemoryServer.create();
    await Mongo.connect({ mongoConnectionString: mongod.getUri(), mongoDbName: 'test-persistencia' });
});

after(async () => {
    await Mongo.client.close();
    await mongod.stop();
});

beforeEach(async () => {
    await Mongo.db.collection('users').deleteMany({});
});

test('deveSalvarERecuperarUsuarioNoBancoDeTeste', async () => {
    // Arrange
    await Mongo.db.collection('users').insertOne({ email: 'persistido@test.com' });

    // Act
    const users = await dataAccess.getUser();

    // Assert
    assert.equal(users.length, 1);
    assert.equal(users[0].email, 'persistido@test.com');
});

test('devePersistirHashDaNovaSenhaQuandoAtualizaSenhaNoBanco', async () => {
    // Arrange
    const { insertedId } = await Mongo.db.collection('users').insertOne({ email: 'senha@test.com' });

    // Act
    await dataAccess.updateUser(insertedId.toString(), { password: 'novaSenha123' });

    // Assert
    const salvo = await Mongo.db.collection('users').findOne({ _id: new ObjectId(insertedId) });
    assert.equal(salvo.password.buffer.length, 16);
    assert.equal(salvo.salt.buffer.length, 16);
    assert.notEqual(typeof salvo.password, 'string');
});

test('deveRemoverUsuarioDoBancoQuandoIdExiste', async () => {
    // Arrange
    const { insertedId } = await Mongo.db.collection('users').insertOne({ email: 'remover@test.com' });

    // Act
    await dataAccess.deleteUser(insertedId.toString());

    // Assert
    assert.equal(await Mongo.db.collection('users').countDocuments(), 0);
});
