import { NextFunction, Request, Response } from "express";
import { sendResponse } from '../utility/api';
import { Logger } from "../interfaces/api";

export class ErrorMiddleware {
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
    }

    errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
        this.logger.error(err);

        const errStatus = (typeof err?.code === 'number' ? err.code : 500) as number;
        const errMsg = err?.message || 'Something went wrong';

        sendResponse(res, errStatus, errMsg);
    }
}