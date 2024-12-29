import { VideoSequelizeService } from "../services/video";
import { video, link, setting } from "../models";
import { Op } from "sequelize";
import { VideoAttributes } from "../models/video";
import { SettingAttributes } from "../models/setting";
import { LinkAttributes } from "../models/link";

jest.mock("../models", () => ({
    video: {
        findAll: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn(),
    },
    link: {
        create: jest.fn(),
        findOne: jest.fn(),
    },
    setting: {
        findOne: jest.fn(),
    },
}));

describe("VideoSequelizeService", () => {
    const service = new VideoSequelizeService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("listVideos", () => {
        it("should return a list of videos", async () => {
            const mockVideos = [
                { id: 1, uniqueId: "video1", fileName: "Video 1", uploadedOn: new Date(), duration: 120, extension: ".mp4", mimeType: "video/mp4" },
                { id: 2, uniqueId: "video2", fileName: "Video 2", uploadedOn: new Date(), duration: 150, extension: ".mp4", mimeType: "video/mp4" },
            ];
            (video.findAll as jest.Mock).mockResolvedValue(mockVideos);

            const result = await service.listVideos();

            expect(video.findAll).toHaveBeenCalled();
            expect(result).toEqual<VideoAttributes[]>(mockVideos);
        });
    });

    describe("createVideo", () => {
        it("should create a video and return its attributes", async () => {
            const mockData = { fileName: "video1", duration: 120, mimeType: "video/mp4", extension: ".mp4", uploadedOn: new Date(), uniqueId: "newUniqueId" };
            const mockVideo = { dataValues: { id: 1, ...mockData } };
            (video.create as jest.Mock).mockResolvedValue(mockVideo);

            const result = await service.createVideo(mockData);

            expect(video.create).toHaveBeenCalledWith(mockData);
            expect(result).toEqual<VideoAttributes>(mockVideo.dataValues);
        });
    });

    describe("updateVideoUniqueIdAndDuration", () => {
        it("should update video uniqueId and duration", async () => {
            const id = 1;
            const duration = 100;
            const uniqueId = "newUniqueId";

            await service.updateVideoUniqueIdAndDuration(id, duration, uniqueId);

            expect(video.update).toHaveBeenCalledWith(
                { uniqueId, duration },
                { where: { id } }
            );
        });
    });

    describe("getVideoConfigurations", () => {
        it("should return video configurations", async () => {
            const mockConfig = { id: 1, maxSize: 100, minSize: 10, maxDuration: 300, minDuration: 30, linkExpiryInMin: 60, maxVideoMergeCount: 5 };
            (setting.findOne as jest.Mock).mockResolvedValue(mockConfig);

            const result = await service.getVideoConfigurations();

            expect(setting.findOne).toHaveBeenCalled();
            expect(result).toEqual<SettingAttributes>(mockConfig);
        });

        it("should return null if no configuration is found", async () => {
            (setting.findOne as jest.Mock).mockResolvedValue(null);

            const result = await service.getVideoConfigurations();

            expect(result).toBeNull();
        });
    });

    describe("getVideoById", () => {
        it("should return video attributes by ID", async () => {
            const id = 1;
            const mockVideo = { id: 1, uniqueId: "video1", fileName: "Video 1", uploadedOn: new Date(), duration: 120, extension: ".mp4", mimeType: "video/mp4" };
            (video.findOne as jest.Mock).mockResolvedValue({ dataValues: mockVideo });

            const result = await service.getVideoById(id);

            expect(video.findOne).toHaveBeenCalledWith({ where: { id } });
            expect(result).toEqual<VideoAttributes>(mockVideo);
        });

        it("should return undefined if video is not found", async () => {
            const id = 2;
            (video.findOne as jest.Mock).mockResolvedValue(null);

            const result = await service.getVideoById(id);

            expect(result).toBeUndefined();
        });
    });

    describe("createVideoLink", () => {
        it("should create a video link and return its attributes", async () => {
            const mockData = { videoId: 1, expiryTime: new Date(), generatedOn: new Date(), uniqueId: "newUniqueId" };
            const mockLink = { id: 1, ...mockData };
            (link.create as jest.Mock).mockResolvedValue({ dataValues: mockLink });

            const result = await service.createVideoLink(mockData);

            expect(link.create).toHaveBeenCalledWith(mockData);
            expect(result).toEqual<LinkAttributes>(mockLink);
        });
    });

    describe("getValidLinkByUniqueId", () => {
        it("should return a valid link with video details", async () => {
            const uniqueId = "validUniqueId";
            const mockLink = {
                id: 1,
                uniqueId,
                videoId: 1,
                generatedOn: new Date(),
                expiryTime: new Date(),
                video: {
                    id: 1,
                    fileName: "Video 1",
                    uploadedOn: new Date(),
                    uniqueId: "videoUniqueId",
                    extension: ".mp4",
                    mimeType: "video/mp4",
                },
            };
            (link.findOne as jest.Mock).mockResolvedValue({ dataValues: mockLink });

            const result = await service.getValidLinkByUniqueId(uniqueId);

            expect(link.findOne).toHaveBeenCalledWith({
                where: {
                    uniqueId,
                    expiryTime: { [Op.gt]: expect.any(Date) },
                },
                include: [
                    {
                        model: video,
                        attributes: ["uniqueId", "extension", "mimeType"],
                        required: true,
                    },
                ],
            });
            expect(result).toEqual<LinkAttributes>(mockLink);
        });

        it("should return undefined if no valid link is found", async () => {
            const uniqueId = "invalidUniqueId";
            (link.findOne as jest.Mock).mockResolvedValue(null);

            const result = await service.getValidLinkByUniqueId(uniqueId);

            expect(result).toBeUndefined();
        });
    });
});
