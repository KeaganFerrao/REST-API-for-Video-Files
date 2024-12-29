import { Logger } from '../interfaces/api';
import ffmpeg from '../setup/ffmpeg';
import { unlink, writeFile } from 'fs/promises';
import { FfmpegUtils } from '../utility/ffmpeg';

jest.mock('fs/promises');
jest.mock('../setup/ffmpeg');

const mockLogger: Logger = {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
};

describe('FfmpegUtils', () => {
    const ffmpegUtils = new FfmpegUtils(mockLogger)

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getVideoProperties', () => {
        it('should resolve with video properties', async () => {
            const buffer = Buffer.from('test');
            const mockMetadata = {
                streams: [
                    { codec_type: 'video', width: 1920, height: 1080, r_frame_rate: '30/1', duration: '60' },
                    { codec_type: 'audio' }
                ]
            };
            (ffmpeg as unknown as jest.Mock).mockReturnValue({
                ffprobe: (callback: Function) => callback(null, mockMetadata)
            });

            const result = await ffmpegUtils.getVideoProperties(buffer);

            expect(result).toEqual({
                resolution: '1920x1080',
                frameRate: '30/1',
                duration: 60,
                audio: true
            });
        });

        it('should reject on error', async () => {
            const buffer = Buffer.from('test');
            const mockError = new Error('ffprobe error');
            (ffmpeg as unknown as jest.Mock).mockReturnValue({
                ffprobe: (callback: Function) => callback(mockError)
            });

            await expect(ffmpegUtils.getVideoProperties(buffer)).rejects.toThrow('ffprobe error');
        });
    });

    describe('trimVideo', () => {
        it('should resolve when trimming is complete', async () => {
            const mockFfmpeg = {
                inputFormat: jest.fn().mockReturnThis(),
                outputFormat: jest.fn().mockReturnThis(),
                setStartTime: jest.fn().mockReturnThis(),
                setDuration: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockImplementation(function (this: typeof mockFfmpeg, event, callback) {
                    if (event === 'end') {
                        callback();
                    }
                    return this;
                }),
                run: jest.fn()
            };
            (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);

            await ffmpegUtils.trimVideo('input.mp4', 'output.mp4', 'mp4', '00:00:00', 60);

            expect(mockLogger.debug).toHaveBeenCalledWith('Trimming complete');
        });

        it('should reject on error', async () => {
            const mockError = new Error('Trimming error');
            const mockFfmpeg = {
                inputFormat: jest.fn().mockReturnThis(),
                outputFormat: jest.fn().mockReturnThis(),
                setStartTime: jest.fn().mockReturnThis(),
                setDuration: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockImplementation(function (this: typeof mockFfmpeg, event, callback) {
                    if (event === 'error') {
                        callback(mockError);
                    }
                    return this;
                }),
                run: jest.fn()
            };
            (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);

            await expect(ffmpegUtils.trimVideo('input.mp4', 'output.mp4', 'mp4', '00:00:00', 60)).rejects.toThrow('Trimming error');
        });
    });

    describe('mergeVideos', () => {
        it('should resolve when merging is complete', async () => {
            const mockFfmpeg = {
                input: jest.fn().mockReturnThis(),
                inputFormat: jest.fn().mockReturnThis(),
                outputFormat: jest.fn().mockReturnThis(),
                inputOptions: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockImplementation(function (this: typeof mockFfmpeg, event, callback) {
                    if (event === 'end') {
                        callback();
                    }
                    return this;
                }),
                run: jest.fn()
            };
            (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);
            (writeFile as jest.Mock).mockResolvedValue(undefined);
            (unlink as jest.Mock).mockResolvedValue(undefined);

            await ffmpegUtils.mergeVideos(['video1.mp4', 'video2.mp4'], 'output.mp4');

            expect(mockLogger.debug).toHaveBeenCalledWith('Merging complete');
            expect(unlink).toHaveBeenCalled();
        });

        it('should reject on error', async () => {
            const mockError = new Error('Merging error');
            const mockFfmpeg = {
                input: jest.fn().mockReturnThis(),
                inputFormat: jest.fn().mockReturnThis(),
                outputFormat: jest.fn().mockReturnThis(),
                inputOptions: jest.fn().mockReturnThis(),
                output: jest.fn().mockReturnThis(),
                on: jest.fn().mockImplementation(function (this: typeof mockFfmpeg, event, callback) {
                    if (event === 'error') {
                        callback(mockError);
                    }
                    return this;
                }),
                run: jest.fn()
            };
            (ffmpeg as unknown as jest.Mock).mockReturnValue(mockFfmpeg);
            (writeFile as jest.Mock).mockResolvedValue(undefined);

            await expect(ffmpegUtils.mergeVideos(['video1.mp4', 'video2.mp4'], 'output.mp4')).rejects.toThrow('Merging error');
        });
    });
});