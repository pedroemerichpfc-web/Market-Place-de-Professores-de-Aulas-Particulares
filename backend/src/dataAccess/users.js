import { Mongo } from '../database/mongo.js';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

const collectionName = 'users';

export default class UsersDataAccess {
    async getUser() {
        const result = await Mongo.db
            .collection(collectionName)
            .find({})
            .toArray();

        return result;
    }

    async deleteUser(userId) {
        const result = await Mongo.db
            .collection(collectionName)
            .findOneAndDelete({ _id: new ObjectId(userId) });

        return result;
    }

    async updateUser(userId, userData) {
        if (userData.password) {
            const salt = crypto.randomBytes(16);

            const hashedPassword = await new Promise((resolve, reject) => {
                try {
                    crypto.pbkdf2(userData.password, salt, 310000, 16, 'sha256', (error, hash) => {
                        if (error) {
                            return reject(new Error('Error during hashing password!'));
                        }
                        resolve(hash);
                    });
                } catch {
                    reject(new Error('Error during hashing password!'));
                }
            });

            userData = { ...userData, password: hashedPassword, salt };
        }

        const result = await Mongo.db
            .collection(collectionName)
            .findOneAndUpdate(
                { _id: new ObjectId(userId) },
                { $set: userData }
            );

        return result;
    }
}