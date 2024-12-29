import { VideoAttributes, VideoCreationAttributes } from "../models/video";
import { link, setting, video } from "../models/index"
import { LinkAttributes, LinkCreationAttributes } from "../models/link";
import { Op } from "sequelize";
import { SettingAttributes } from "../models/setting";
import { VideoService } from "../interfaces/services";

export class VideoSequelizeService implements VideoService {

    async listVideos(): Promise<VideoAttributes[]> {
        const videos = await video.findAll();
        return videos;
    }

    async createVideo(data: VideoCreationAttributes): Promise<VideoAttributes> {
        const instance = await video.create(data);
        return instance.dataValues;
    }

    async updateVideoUniqueIdAndDuration(id: number, duration: number, newUniqueId: string): Promise<void> {
        await video.update({
            uniqueId: newUniqueId,
            duration
        }, {
            where: {
                id
            }
        });
    }

    async getVideoConfigurations(): Promise<SettingAttributes | undefined | null> {
        const config = await setting.findOne();
        return config;
    }

    async getVideoById(id: number): Promise<VideoAttributes | undefined | null> {
        const instance = await video.findOne({
            where: {
                id
            }
        });

        return instance?.dataValues;
    }

    async createVideoLink(data: LinkCreationAttributes): Promise<LinkAttributes> {
        const instance = await link.create(data);

        return instance.dataValues;
    }

    async getValidLinkByUniqueId(uniqueId: string): Promise<LinkAttributes | undefined | null> {
        const instance = await link.findOne({
            where: {
                uniqueId,
                expiryTime: {
                    [Op.gt]: new Date()
                },
            },
            include: [
                {
                    model: video,
                    attributes: ['uniqueId', 'extension', 'mimeType'],
                    required: true
                }
            ]
        });

        return instance?.dataValues;
    }
}