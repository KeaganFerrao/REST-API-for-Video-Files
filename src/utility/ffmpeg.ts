import path from "path";
import ffmpeg from "../setup/ffmpeg";
import { VideoProperties } from "../types/video";
import { Readable } from "stream";
import { unlink, writeFile } from "fs/promises";
import { Logger, VideoUtils } from "../interfaces/api";

export class FfmpegUtils implements VideoUtils {
    private logger: Logger

    constructor(logger: Logger) {
        this.logger = logger;
    }

    getVideoProperties = async (buffer: Buffer): Promise<VideoProperties> => {
        return new Promise((resolve, reject) => {
            const bufferStream = new Readable();
            bufferStream.push(buffer);
            bufferStream.push(null);

            ffmpeg(bufferStream)
                .ffprobe((err, metadata) => {
                    if (err) {
                        return reject(err);
                    }
                    const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                    const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                    const resolution = videoStream ? `${videoStream.width}x${videoStream.height}` : null;
                    const frameRate = videoStream ? videoStream.r_frame_rate : null;
                    resolve({
                        resolution,
                        frameRate,
                        duration: videoStream ? Number(videoStream.duration) : null,
                        audio: audioStream ? true : false,
                    });
                });
        });
    }

    trimVideo = async (inputFile: string, outputFile: string, outputFormat: string, startTime: string, duration: number): Promise<void> => {
        const targetDirectory = path.join(__dirname, '../', 'uploads');
        inputFile = path.join(targetDirectory, inputFile);
        outputFile = path.join(targetDirectory, outputFile);

        return new Promise((resolve, reject) => {
            ffmpeg(inputFile)
                .inputFormat(outputFormat)
                .outputFormat(outputFormat)
                .setStartTime(startTime)
                .setDuration(duration)
                .output(outputFile)
                .on('start', (commandLine) => {
                    this.logger.debug(`Spawned FFmpeg with command:, ${commandLine}`);
                })
                .on('end', () => {
                    this.logger.debug('Trimming complete');
                    resolve();
                })
                .on('error', (err) => {
                    this.logger.debug(`Error during trimming: ${err}`);
                    reject(err);
                })
                .run();
        })
    }

    mergeVideos = async (videoFiles: string[], outputFile: string): Promise<void> => {
        const uploadsDirectory = path.join(__dirname, '../', 'uploads');
        const listContent = videoFiles.map(file => {
            return `file '${path.join(uploadsDirectory, file)}'`
        }).join('\n');

        const tempDirectory = path.join(__dirname, '../', 'temp');
        const listFilePath = path.join(tempDirectory, `${outputFile}_list.txt`);

        await writeFile(listFilePath, listContent, 'utf8');
        outputFile = path.join(uploadsDirectory, outputFile);

        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(listFilePath)
                .inputFormat('concat')
                .outputFormat('mp4')
                .inputOptions(['-safe 0'])
                .output(outputFile)
                .on('start', (commandLine) => {
                    this.logger.debug(`Spawned FFmpeg with command:, ${commandLine}`);
                })
                .on('end', async () => {
                    this.logger.debug('Merging complete');

                    try {
                        await unlink(listFilePath);
                        resolve();
                    } catch (error) {
                        this.logger.debug(`Error during unlinking after merge:, ${error}`);
                        reject(error);
                    }
                })
                .on('error', (err) => {
                    this.logger.debug(`Error during merging:, ${err}`);
                    reject(err);
                })
                .run();
        })
    }
}