import { createReadStream, ReadStream } from "fs";
import { unlink, writeFile } from "fs/promises";
import path from "path";
import { FileSystemUtils } from "../interfaces/api";
import { API_BASE_URL } from "../setup/secrets";

export class LocalFileSystemUtils implements FileSystemUtils {
    
    async uploadFile(fileBuffer: Buffer, fileName: string) {
        const targetDirectory = path.join(__dirname, '../', 'uploads');
        const filePath = path.join(targetDirectory, fileName);

        await writeFile(filePath, fileBuffer);
    }

    async deleteFile(fileName: string) {
        const targetDirectory = path.join(__dirname, '../', 'uploads');
        const filePath = path.join(targetDirectory, fileName);

        await unlink(filePath);
    }

    async downloadFile(fileName: string): Promise<ReadStream> {
        const targetDirectory = path.join(__dirname, '../', 'uploads');
        const filePath = path.join(targetDirectory, fileName);

        const readStream = createReadStream(filePath);
        return readStream;
    }

    async generateFileLink(uniqueId: string, expiry: string): Promise<string> {
        return `${API_BASE_URL!}/v1/video/download/${uniqueId}?expiry=${expiry}`;
    }
}