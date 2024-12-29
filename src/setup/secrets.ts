import { config } from "dotenv";

config({
    path: '../.env'
});

export const {
    PORT,
    FFMPEG_PATH,
    API_BASE_URL,
} = process.env;