import UsersDataAccess from '../dataAccess/users.js';
import { ok, serverError } from '../helpers/httpResponse.js';

export default class UsersController {
    constructor() {
        this.usersDataAccess = new UsersDataAccess();
    }

    async getUsers() {
        try {
            const users = await this.usersDataAccess.getUser();

            return ok(users);
        } catch (error) {
            return serverError(error);
        }
    }

    async deleteUser(userId) {
        try {
            const result = await this.usersDataAccess.deleteUser(userId);
            
            return ok(result);
        } catch (error) {
            return serverError(error);
        }
    }

    async updateUser(userId, userData) {
        try {
            const result = await this.usersDataAccess.updateUser(userId, userData);
            
            return ok(result);
        } catch (error) {
            return serverError(error);
        }
    }
}