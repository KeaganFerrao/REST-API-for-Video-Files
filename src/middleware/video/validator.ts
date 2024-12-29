import { sendResponse } from "../../utility/api";
import { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import moment from "moment";

const ValidateReqParams = async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors: Record<string, any>[] = [];
    errors.array().forEach(err => {
        if (err.type === 'field') {
            extractedErrors.push({ [err.path]: err.msg })
        }
    })

    sendResponse(res, 422, 'Invalid or missing parameters', [], extractedErrors);
}

const TrimVideoValidationRules = () => {
    return [
        param('id')
            .isInt({ min: 1 }).withMessage('Id must be of type integer').bail(),
        body('startTime')
            .isString().withMessage('StartTime must be a string').bail()
            .custom((value) => {
                if (!moment(value, 'HH:mm:ss', true).isValid()) {
                    throw new Error('Please provide a valid start time in HH:mm:ss format');
                }
                return true;
            }),
        body('endTime')
            .isString().withMessage('EndTime must be a string').bail()
            .custom((value, { req }) => {
                if (!moment(value, 'HH:mm:ss', true).isValid()) {
                    throw new Error('Please provide a valid end time in HH:mm:ss format');
                }
                if (moment(value, 'HH:mm:ss').isBefore(moment(req.body.startTime, 'HH:mm:ss'))) {
                    throw new Error('End time must be greater than start time');
                }
                return true;
            }),
        body('override')
            .isBoolean({ strict: true }).withMessage('Override must be a boolean').bail()
    ]
}

const IdValidationRules = () => {
    return [
        param('id')
            .isInt({ min: 1 }).withMessage('Id must be of type integer').bail()
    ]
}

const UUIDValidationRules = () => {
    return [
        param('id')
            .isUUID().withMessage('Id must be of type UUID').bail()
    ]
}

const MergeVideosValidationRules = () => {
    return [
        query('ids')
            .custom((value) => {
                const ids = value.split(',');
                for (const id of ids) {
                    if (!Number.isInteger(Number(id))) {
                        throw new Error('Id must be of type integer');
                    }
                }
                return true;
            })
    ]
}

export {
    ValidateReqParams,
    TrimVideoValidationRules,
    IdValidationRules,
    UUIDValidationRules,
    MergeVideosValidationRules
}