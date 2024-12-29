import { UserAttributes } from "src/models/user"
import { LinkAttributes, LinkCreationAttributes } from "../models/link"
import { SettingAttributes } from "../models/setting"
import { VideoAttributes, VideoCreationAttributes } from "../models/video"

export interface VideoService {
    createVideo(video: VideoCreationAttributes): Promise<VideoAttributes>
    updateVideoUniqueIdAndDuration(id: number, duration: number, newUniqueId: string): Promise<void>
    getVideoConfigurations(): Promise<SettingAttributes | undefined | null>
    getVideoById(id: number): Promise<VideoAttributes | undefined | null>
    createVideoLink(link: LinkCreationAttributes): Promise<LinkAttributes>
    getValidLinkByUniqueId(uniqueId: string): Promise<LinkAttributes | undefined | null>
    listVideos(): Promise<VideoAttributes[]>
}

export interface UserService {
    getUserFromAPIKey(apiKey: string): Promise<UserAttributes | undefined>
}