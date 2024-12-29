import { UserService } from "../interfaces/services";
import { user } from "../models/index"
import { UserAttributes } from "../models/user";

export class UserSequelizeService implements UserService {

    async getUserFromAPIKey(apiKey: string): Promise<UserAttributes | undefined> {
        const instance = await user.findOne({
            attributes: ['id', 'userName', 'token'],
            where: {
                token: apiKey
            }
        });

        return instance?.dataValues;
    }
}