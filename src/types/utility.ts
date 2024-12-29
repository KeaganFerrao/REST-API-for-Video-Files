import { Request } from "express";

export type ServerResponse = {
    success: boolean;
    message: string;
    data: any;
    errors: any[];
}

export interface RequestWithPayload<T> extends Request {
    payload?: T;
}

export interface VideoUploadPayload {
    videoDuration?: number | null;
}