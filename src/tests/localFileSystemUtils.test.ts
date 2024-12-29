import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { LocalFileSystemUtils } from '../utility/video';
import { createReadStream } from 'fs';

jest.mock('fs/promises', () => ({
    writeFile: jest.fn(),
    unlink: jest.fn(),
}));

jest.mock('fs', () => ({
    createReadStream: jest.fn(),
}));

describe('LocalFileSystemUtils', () => {
    const fileSystemUtils = new LocalFileSystemUtils();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadFile', () => {
        it('should write file to the correct path', async () => {
            const buffer = Buffer.from('file content');
            const fileName = 'test.txt';
            const targetDirectory = path.join(__dirname, '../', 'uploads');
            const filePath = path.join(targetDirectory, fileName);

            await fileSystemUtils.uploadFile(buffer, fileName);

            expect(writeFile).toHaveBeenCalledWith(filePath, buffer);
        });
    });

    describe('deleteFile', () => {
        it('should delete the file from the correct path', async () => {
            const fileName = 'test.txt';
            const targetDirectory = path.join(__dirname, '../', 'uploads');
            const filePath = path.join(targetDirectory, fileName);

            await fileSystemUtils.deleteFile(fileName);

            expect(unlink).toHaveBeenCalledWith(filePath);
        });
    });

    describe('downloadFile', () => {
        it('should return a read stream for the file', async () => {
            const fileName = 'test.txt';
            const targetDirectory = path.join(__dirname, '../', 'uploads');
            const filePath = path.join(targetDirectory, fileName);

            const mockStream = {} as any;
            (createReadStream as jest.Mock).mockReturnValue(mockStream);

            const result = await fileSystemUtils.downloadFile(fileName);

            expect(createReadStream).toHaveBeenCalledWith(filePath);
            expect(result).toBe(mockStream);
        });
    });

    describe('generateFileLink', () => {
        it('should generate the correct file link', async () => {
            const uniqueId = '123';
            const expiry = '2024-12-31';
            const link = `${process.env.API_BASE_URL}/v1/video/download/${uniqueId}?expiry=${expiry}`;

            const result = await fileSystemUtils.generateFileLink(uniqueId, expiry);

            expect(result).toBe(link);
        });
    });
});
