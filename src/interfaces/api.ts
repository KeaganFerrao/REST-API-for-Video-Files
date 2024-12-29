import { ReadStream } from "fs";
import { VideoProperties } from "src/types/video";

export interface Logger {
    debug: (message: string) => any;
    error: (message: string) => any;
    info: (message: string) => any;
}

export interface FileSystemUtils {
    uploadFile(fileBuffer: Buffer, fileName: string): Promise<void>
    deleteFile(fileName: string): Promise<void>
    downloadFile(fileName: string): Promise<ReadStream>
    generateFileLink(uniqueId: string, expiry: string): Promise<string>
}

export interface VideoUtils {
    getVideoProperties(buffer: Buffer): Promise<VideoProperties>
    trimVideo(inputFile: string, outputFile: string, outputFormat: string, startTime: string, duration: number): Promise<void>
    mergeVideos(videoFiles: string[], outputFile: string): Promise<void>
}