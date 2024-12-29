import moment from "moment";
import { RequestWithPayload, VideoUploadPayload } from "../types/utility";
import { sendResponse } from "../utility/api";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import { VideoService } from "../interfaces/services";
import { FileSystemUtils, Logger, VideoUtils } from "../interfaces/api";

export class VideoController {
    private videoService: VideoService;
    private fileSystemUtils: FileSystemUtils;
    private videoUtils: VideoUtils;
    private logger: Logger;

    constructor(videoService: VideoService, fileSystemUtils: FileSystemUtils, videoUtils: VideoUtils, logger: Logger) {
        this.videoService = videoService;
        this.fileSystemUtils = fileSystemUtils;
        this.videoUtils = videoUtils;
        this.logger = logger;
    }

    UploadVideo = async (req: RequestWithPayload<VideoUploadPayload>, res: Response, next: NextFunction) => {
        try {
            const file = req?.file!;
            const { videoDuration } = req.payload!;

            const uniqueId = uuidv4();
            await this.fileSystemUtils.uploadFile(file.buffer, uniqueId);

            const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
            const instance = await this.videoService.createVideo({
                uniqueId,
                fileName: file.originalname,
                uploadedOn: new Date(),
                duration: videoDuration,
                mimeType: file.mimetype,
                extension: fileExtension
            })

            sendResponse(res, 201, 'Video uploaded successfully', {
                uniqueId: instance.uniqueId,
            });
        } catch (error: any) {
            this.logger.error(`Error in creating video`);
            this.logger.error(error);
            next(error);
        }
    }

    TrimVideo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);
            const { startTime, endTime, override } = req.body;

            const video = await this.videoService.getVideoById(id);
            if (!video) {
                return sendResponse(res, 404, 'Video not found');
            }

            const duration = video.duration;
            if (!duration) {
                console.log('Unable to get video duration');
                return sendResponse(res, 400, 'Unable to get video duration');
            }

            const start = moment(startTime, 'HH:mm:ss');
            const end = moment(endTime, 'HH:mm:ss');
            const diff = end.diff(start, 'seconds');

            if (diff > duration) {
                console.log('Trim duration cannot be greater than video duration');
                return sendResponse(res, 400, 'Trim duration cannot be greater than video duration');
            }

            const fileExtension = video.extension;
            const uniqueId = uuidv4();
            await this.videoUtils.trimVideo(video.uniqueId, uniqueId, fileExtension, startTime, diff);

            if (override) {
                await this.videoService.updateVideoUniqueIdAndDuration(id, diff, uniqueId);
                await this.fileSystemUtils.deleteFile(video.uniqueId);
            } else {
                await this.videoService.createVideo({
                    uniqueId: uniqueId,
                    fileName: video.fileName,
                    uploadedOn: new Date(),
                    duration: diff,
                    extension: video.extension,
                    mimeType: video.mimeType
                })
            }

            sendResponse(res, 200, 'Video trimmed successfully', {
                uniqueId
            });
        } catch (error: any) {
            this.logger.error(`Error in trimming video`);
            this.logger.error(error);
            next(error);
        }
    }

    GenerateLink = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = Number(req.params.id);

            const video = await this.videoService.getVideoById(id);
            if (!video) {
                return sendResponse(res, 404, 'Video not found');
            }

            const settings = await this.videoService.getVideoConfigurations();
            if (!settings) {
                return sendResponse(res, 500, 'Configurations not found');
            }

            const expiry = moment().add(settings.linkExpiryInMin, 'minutes').toDate();
            const uniqueId = uuidv4()
            const linkInstance = await this.videoService.createVideoLink({
                videoId: video.id,
                uniqueId: uniqueId,
                expiryTime: expiry,
                generatedOn: new Date()
            })

            const link = await this.fileSystemUtils.generateFileLink(linkInstance.uniqueId, expiry.toISOString());

            sendResponse(res, 201, 'Link generated successfully', {
                link
            });
        } catch (error: any) {
            this.logger.error(`Error in generating link`);
            this.logger.error(error);
            next(error);
        }
    }

    DownloadVideo = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id;

            const link = await this.videoService.getValidLinkByUniqueId(id);
            if (!link) {
                return sendResponse(res, 404, 'Invalid link');
            }

            const videoUniqueId = link.video!.uniqueId;
            const readStream = await this.fileSystemUtils.downloadFile(videoUniqueId);

            res.setHeader('Content-Disposition', `attachment; filename=${videoUniqueId}.${link.video!.extension}`);
            res.setHeader('Content-Type', link.video!.mimeType);
            readStream.pipe(res);

            readStream.on('error', (error: any) => {
                this.logger.error(`Error in downloading video`);
                this.logger.error(error);
                res.end();
            })
        } catch (error: any) {
            this.logger.error(`Error in downloading video`);
            this.logger.error(error);
            next(error);
        }
    }

    MergeVideos = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ids = String(req.query.ids!).split(',');

            const videoUniqueIds: string[] = [];
            let totalDuration = 0;
            for (const id of ids) {
                const video = await this.videoService.getVideoById(Number(id));
                if (!video) {
                    return sendResponse(res, 404, `Video with id ${id} not found`);
                }
                videoUniqueIds.push(video.uniqueId);
                totalDuration += video.duration!;
            }

            const uniqueId = uuidv4();
            await this.videoUtils.mergeVideos(videoUniqueIds, uniqueId);

            const instance = await this.videoService.createVideo({
                uniqueId,
                fileName: `merged_${new Date().toISOString()}.mp4`,
                uploadedOn: new Date(),
                duration: totalDuration,
                mimeType: 'video/mp4',
                extension: 'mp4'
            })

            sendResponse(res, 201, 'Videos merged successfully', {
                uniqueId: instance.uniqueId
            });
        } catch (error: any) {
            this.logger.error(`Error in merging videos`);
            this.logger.error(error);
            next(error);

        }
    }

    GetVideoList = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const videos = await this.videoService.listVideos();

            sendResponse(res, 200, 'Videos fetched successfully', videos);
        } catch (error: any) {
            this.logger.error(`Error in getting video properties`);
            this.logger.error(error);
            next(error);
        }
    }
}