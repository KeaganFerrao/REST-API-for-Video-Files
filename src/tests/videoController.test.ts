
import { VideoController } from "../controllers/video";
import { Request, Response, NextFunction } from "express";
import { VideoService } from "../interfaces/services";
import { FileSystemUtils, Logger, VideoUtils } from "../interfaces/api";
import { RequestWithPayload, VideoUploadPayload } from "../types/utility";
import { sendResponse } from "../utility/api";
import { v4 as uuidv4 } from 'uuid';
import moment from "moment";
import path from "path";

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

jest.mock('moment', () => {
    const mMoment = {
        format: jest.fn().mockReturnThis(),
        valueOf: jest.fn(),
        add: jest.fn().mockReturnThis(),
        toDate: jest.fn(),
    };
    return jest.fn(() => mMoment);
});

jest.mock('path', () => ({
    extname: jest.fn(),
}));

jest.mock("../utility/api", () => ({
    sendResponse: jest.fn(),
}));

describe("VideoController", () => {
    let videoService: jest.Mocked<VideoService>;
    let fileSystemUtils: jest.Mocked<FileSystemUtils>;
    let videoUtils: jest.Mocked<VideoUtils>;
    let logger: jest.Mocked<Logger>;
    let controller: VideoController;
    let req: Partial<RequestWithPayload<VideoUploadPayload>>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        videoService = {
            createVideo: jest.fn(),
            getVideoById: jest.fn(),
            updateVideoUniqueIdAndDuration: jest.fn(),
            getVideoConfigurations: jest.fn(),
            createVideoLink: jest.fn(),
            getValidLinkByUniqueId: jest.fn(),
            listVideos: jest.fn(),
        } as any;

        fileSystemUtils = {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
            generateFileLink: jest.fn(),
            downloadFile: jest.fn(),
        } as any;

        videoUtils = {
            trimVideo: jest.fn(),
            mergeVideos: jest.fn(),
        } as any;

        logger = {
            error: jest.fn(),
        } as any;

        controller = new VideoController(videoService, fileSystemUtils, videoUtils, logger);

        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            end: jest.fn(),
        };
        next = jest.fn();
    });

    describe("UploadVideo", () => {
        it("should upload a video and return its unique ID", async () => {
            const mockFile = {
                buffer: Buffer.from("test"),
                originalname: "test.mp4",
                mimetype: "video/mp4",
                fieldname: "video",
                encoding: "7bit",
                size: 12345,
                stream: {} as any,
                destination: "uploads/",
                filename: "test.mp4",
                path: "uploads/test.mp4"
            };
            const mockPayload = { videoDuration: 120 };
            const mockUniqueId = "unique-id";
            const mockVideo = {
                uniqueId: mockUniqueId,
                id: 1,
                fileName: "test.mp4",
                uploadedOn: new Date(),
                extension: "mp4",
                mimeType: "video/mp4",
                duration: 120
            };

            req.file = mockFile;
            req.payload = mockPayload;
            (uuidv4 as jest.Mock).mockReturnValue(mockUniqueId);
            (path.extname as jest.Mock).mockReturnValue(".mp4");
            videoService.createVideo.mockResolvedValue(mockVideo);

            await controller.UploadVideo(req as RequestWithPayload<VideoUploadPayload>, res as Response, next);

            expect(fileSystemUtils.uploadFile).toHaveBeenCalledWith(mockFile.buffer, mockUniqueId);
            expect(videoService.createVideo).toHaveBeenCalledWith({
                uniqueId: mockUniqueId,
                fileName: mockFile.originalname,
                uploadedOn: expect.any(Date),
                duration: mockPayload.videoDuration,
                mimeType: mockFile.mimetype,
                extension: "mp4",
            });
            expect(sendResponse).toHaveBeenCalledWith(res, 201, 'Video uploaded successfully', { uniqueId: mockUniqueId });
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            req.file = {
                buffer: Buffer.from("test"),
                originalname: "test.mp4",
                mimetype: "video/mp4",
                fieldname: "video",
                encoding: "7bit",
                size: 12345,
                stream: {} as any,
                destination: "uploads/",
                filename: "test.mp4",
                path: "uploads/test.mp4"
            };
            req.payload = { videoDuration: 120 };
            (uuidv4 as jest.Mock).mockReturnValue("unique-id");
            (path.extname as jest.Mock).mockReturnValue(".mp4");
            videoService.createVideo.mockRejectedValue(error);

            await controller.UploadVideo(req as RequestWithPayload<VideoUploadPayload>, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in creating video`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("TrimVideo", () => {
        it("should trim a video and return success message", async () => {
            const mockVideo = { id: 1, uniqueId: "video1", duration: 120, extension: "mp4", fileName: "test.mp4", mimeType: "video/mp4", uploadedOn: new Date() };
            const mockUniqueId = "unique-id";
            req.params = { id: "1" };
            req.body = { startTime: "00:00:00", endTime: "00:01:00", override: true };
            (uuidv4 as jest.Mock).mockReturnValue(mockUniqueId);
            videoService.getVideoById.mockResolvedValue(mockVideo);
            (moment as any).mockImplementation((time: string) => ({
                diff: (start: any, unit: string) => 60,
            }));

            await controller.TrimVideo(req as Request, res as Response, next);

            expect(videoUtils.trimVideo).toHaveBeenCalledWith(mockVideo.uniqueId, mockUniqueId, mockVideo.extension, "00:00:00", 60);
            expect(videoService.updateVideoUniqueIdAndDuration).toHaveBeenCalledWith(mockVideo.id, 60, mockUniqueId);
            expect(fileSystemUtils.deleteFile).toHaveBeenCalledWith(mockVideo.uniqueId);
            expect(sendResponse).toHaveBeenCalledWith(res, 200, 'Video trimmed successfully', { uniqueId: mockUniqueId });
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            req.params = { id: "1" };
            req.body = { startTime: "00:00:00", endTime: "00:01:00", override: true };
            videoService.getVideoById.mockRejectedValue(error);

            await controller.TrimVideo(req as Request, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in trimming video`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("GenerateLink", () => {
        it("should generate a link for a video", async () => {
            const mockVideo = {
                id: 1,
                uniqueId: "video1",
                fileName: "test.mp4",
                uploadedOn: new Date(),
                extension: "mp4",
                mimeType: "video/mp4",
                duration: 120
            };
            const mockSettings = {
                id: 1,
                linkExpiryInMin: 60,
                maxSize: 1000,
                minSize: 10,
                maxDuration: 3600,
                minDuration: 60,
                maxVideoMergeCount: 5
            };
            const mockUniqueId = "unique-id";
            const mockGeneratedLink = "http://example.com/video";

            req.params = { id: "1" };
            videoService.getVideoById.mockResolvedValue(mockVideo);
            videoService.getVideoConfigurations.mockResolvedValue(mockSettings);
            (moment as any).mockImplementation((time: string) => ({
                add: (duration: number, unit: string) => ({ toDate: () => new Date() }),
            }));
            (uuidv4 as jest.Mock).mockReturnValue(mockUniqueId);

            videoService.createVideoLink.mockResolvedValue({
                id: 1,
                videoId: mockVideo.id,
                uniqueId: mockUniqueId,
                expiryTime: new Date(),
                generatedOn: new Date(),
            });
            fileSystemUtils.generateFileLink.mockResolvedValue(mockGeneratedLink);

            await controller.GenerateLink(req as Request, res as Response, next);

            expect(videoService.createVideoLink).toHaveBeenCalledWith({
                videoId: mockVideo.id,
                uniqueId: mockUniqueId,
                expiryTime: expect.any(Date),
                generatedOn: expect.any(Date),
            });
            expect(fileSystemUtils.generateFileLink).toHaveBeenCalledWith(mockUniqueId, expect.any(String));
            expect(sendResponse).toHaveBeenCalledWith(res, 201, 'Link generated successfully', { link: mockGeneratedLink });
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            req.params = { id: "1" };
            videoService.getVideoById.mockRejectedValue(error);

            await controller.GenerateLink(req as Request, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in generating link`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("DownloadVideo", () => {
        it("should download a video", async () => {
            const mockLink = {
                id: 1,
                videoId: 1,
                uniqueId: "unique-id",
                expiryTime: new Date(),
                generatedOn: new Date(),
                video: { id: 1, uniqueId: "video1", fileName: "test.mp4", uploadedOn: new Date(), extension: "mp4", mimeType: "video/mp4" },
            };
            const mockReadStream = {
                pipe: jest.fn(),
                on: jest.fn(),
            };

            req.params = { id: "unique-id" };
            videoService.getValidLinkByUniqueId.mockResolvedValue(mockLink);
            fileSystemUtils.downloadFile.mockResolvedValue(mockReadStream as any);

            await controller.DownloadVideo(req as Request, res as Response, next);

            expect(videoService.getValidLinkByUniqueId).toHaveBeenCalledWith("unique-id");
            expect(fileSystemUtils.downloadFile).toHaveBeenCalledWith("video1");
            expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename=video1.mp4');
            expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'video/mp4');
            expect(mockReadStream.pipe).toHaveBeenCalledWith(res);
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            req.params = { id: "unique-id" };
            videoService.getValidLinkByUniqueId.mockRejectedValue(error);

            await controller.DownloadVideo(req as Request, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in downloading video`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("MergeVideos", () => {
        it("should merge videos and return the unique ID of the merged video", async () => {
            const mockVideos = [
                { id: 1, uniqueId: "video1", duration: 120 },
                { id: 2, uniqueId: "video2", duration: 150 },
            ];
            const mockUniqueId = "unique-id";
            const mockMergedVideo = { uniqueId: mockUniqueId };

            req.query = { ids: "1,2" };
            videoService.getVideoById.mockResolvedValueOnce(mockVideos[0] as any);
            videoService.getVideoById.mockResolvedValueOnce(mockVideos[1] as any);
            (uuidv4 as jest.Mock).mockReturnValue(mockUniqueId);
            videoService.createVideo.mockResolvedValue({
                uniqueId: mockUniqueId,
                id: 1,
                fileName: "merged.mp4",
                uploadedOn: new Date(),
                extension: "mp4",
                mimeType: "video/mp4",
                duration: 270
            });

            await controller.MergeVideos(req as Request, res as Response, next);

            expect(videoUtils.mergeVideos).toHaveBeenCalledWith(["video1", "video2"], mockUniqueId);
            expect(videoService.createVideo).toHaveBeenCalledWith({
                uniqueId: mockUniqueId,
                fileName: expect.any(String),
                uploadedOn: expect.any(Date),
                duration: 270,
                mimeType: 'video/mp4',
                extension: 'mp4',
            });
            expect(sendResponse).toHaveBeenCalledWith(res, 201, 'Videos merged successfully', { uniqueId: mockUniqueId });
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            req.query = { ids: "1,2" };
            videoService.getVideoById.mockRejectedValue(error);

            await controller.MergeVideos(req as Request, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in merging videos`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("GetVideoList", () => {
        it("should return a list of videos", async () => {
            const mockVideos = [
                { id: 1, uniqueId: "video1", fileName: "Video 1", uploadedOn: new Date(), duration: 120, extension: ".mp4", mimeType: "video/mp4" },
                { id: 2, uniqueId: "video2", fileName: "Video 2", uploadedOn: new Date(), duration: 150, extension: ".mp4", mimeType: "video/mp4" },
            ];
            videoService.listVideos.mockResolvedValue(mockVideos);

            await controller.GetVideoList(req as Request, res as Response, next);

            expect(videoService.listVideos).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(res, 200, 'Videos fetched successfully', mockVideos);
        });

        it("should handle errors", async () => {
            const error = new Error("Test error");
            videoService.listVideos.mockRejectedValue(error);

            await controller.GetVideoList(req as Request, res as Response, next);

            expect(logger.error).toHaveBeenCalledWith(`Error in getting video properties`);
            expect(logger.error).toHaveBeenCalledWith(error);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});