import ffmpeg from 'fluent-ffmpeg';
import { FFMPEG_PATH } from './secrets';

if (FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
}

export default ffmpeg;