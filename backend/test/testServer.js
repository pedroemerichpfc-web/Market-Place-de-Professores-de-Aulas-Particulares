import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Mongo } from '../src/database/mongo.js';
import authRouter from '../src/auth/auth.js';
import usersRouter from '../src/routes/users.js';

let mongod;
let server;

export async function start() {
    mongod = await MongoMemoryServer.create();
    await Mongo.connect({ mongoConnectionString: mongod.getUri(), mongoDbName: 'test' });

    const app = express();
    app.use(express.json());

    app.get('/', (req, res) => {
        res.send({
            success: true,
            statusCode: 200,
            body: 'Hello World'
        });
    });

    app.use('/auth', authRouter);
    app.use('/users', usersRouter);

    server = await new Promise((resolve) => {
        const listening = app.listen(0, () => resolve(listening));
    });

    const { port } = server.address();
    return `http://127.0.0.1:${port}`;
}

export async function stop() {
    await new Promise((resolve) => server.close(resolve));
    await Mongo.client.close();
    await mongod.stop();
}

export async function clearUsers() {
    await Mongo.db.collection('users').deleteMany({});
}

export async function request(base, method, path, body) {
    const response = await fetch(`${base}${path}`, {
        method,
        headers: body ? { 'content-type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
    });

    return { response, data: await response.json() };
}

export async function signup(base, email, password) {
    return request(base, 'POST', '/auth/signup', { email, password });
}
