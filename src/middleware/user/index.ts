import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utility/api";
import { UserService } from "../../interfaces/services";
import { Logger } from "src/interfaces/api";

export class UserMiddleware {
    private userService: UserService;
    private logger: Logger;

    constructor(userService: UserService, logger: Logger) {
        this.userService = userService;
        this.logger = logger;
    }

    ValidateUserAPIKey = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const apiKey = req.headers['x-api-key'];
            if (!apiKey) {
                return sendResponse(res, 401, 'API key is missing');
            }

            const user = await this.userService.getUserFromAPIKey(apiKey as string);
            if (!user) {
                return sendResponse(res, 401, 'Invalid API key');
            }

            next();
        } catch (error: any) {
            this.logger.error('Error validating API key');
            this.logger.error(error);
            next(error);
        }
    }
}