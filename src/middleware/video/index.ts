import { Logger, VideoUtils } from "../../interfaces/api";
import { VideoService } from "../../interfaces/services";
import multer from "../../setup/multer";
import { RequestWithPayload, VideoUploadPayload } from "../../types/utility";
import { sendResponse } from "../../utility/api";
import { NextFunction, Response } from "express";
import { MulterError } from "multer";
import path from "path";

export class VideoMiddleware {
    private videoService: VideoService;
    private videoUtils: VideoUtils;
    private logger: Logger

    constructor(videoService: VideoService, videoUtils: VideoUtils, logger: Logger) {
        this.videoService = videoService;
        this.videoUtils = videoUtils;
        this.logger = logger;
    }

    ValidateVideoUpload = (params: { fileName: string }) => {
        return async (req: RequestWithPayload<VideoUploadPayload>, res: Response, next: NextFunction) => {
            try {
                const config = await this.videoService.getVideoConfigurations();
                if (!config) {
                    this.logger.error('Configurations not found');
                    return sendResponse(res, 500, 'Configurations not found');
                }

                const allowedExtensions = ['.mp4', '.mov'];
                const minVideoSize = config.minSize;
                const maxVideoSize = config.maxSize;
                const minDuration = config.minDuration;
                const maxDuration = config.maxDuration;

                const upload = multer(maxVideoSize).single(params.fileName);

                upload(req, res, async (err) => {
                    if (err instanceof MulterError) {
                        switch (err.code) {
                            case 'LIMIT_UNEXPECTED_FILE':
                                return sendResponse(res, 422, `Only a single file with the field name: ${params.fileName} is allowed`);
                            case 'LIMIT_FILE_SIZE':
                                return sendResponse(res, 422, `Max. allowed file size is ${maxVideoSize} MB`);
                            default:
                                return sendResponse(res, 400, err.code);
                        }
                    } else if (err) {
                        this.logger.error(err);
                        return sendResponse(res, 500, 'Error uploading file');
                    }

                    if (!req.file) {
                        return sendResponse(res, 400, 'No file uploaded');
                    }
                    if (req.file.originalname.length > 100) {
                        return sendResponse(res, 400, 'File name too long');
                    }

                    const fileExtension = path.extname(req.file.originalname).toLowerCase();

                    if (!allowedExtensions.includes(fileExtension)) {
                        return sendResponse(res, 400, 'Invalid file extension, allowed extensions are .mp4, .mov');
                    }

                    const fileSizeInKb = req.file.size / 1024;
                    if (fileSizeInKb < minVideoSize || fileSizeInKb > maxVideoSize) {
                        return sendResponse(res, 400, `Video size must be at least ${minVideoSize} KB and at most ${maxVideoSize} KB`);
                    }

                    const videoProperties = await this.videoUtils.getVideoProperties(req.file.buffer);
                    if (videoProperties.duration && (videoProperties.duration < minDuration || videoProperties.duration > maxDuration)) {
                        return sendResponse(res, 400, `Video duration must be at least ${minDuration} seconds and at most ${maxDuration} seconds`);
                    }

                    req.payload = {
                        videoDuration: videoProperties.duration
                    }
                    next();
                })
            } catch (error: any) {
                this.logger.error(error);
                sendResponse(res, 500, 'Internal Server Error');
            }
        }

    }
}