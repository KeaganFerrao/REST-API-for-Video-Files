import ffmpeg from 'fluent-ffmpeg';
import { FFMPEG_PATH, FFPROBE_PATH } from './secrets';

if (FFMPEG_PATH) {
    ffmpeg.setFfmpegPath(FFMPEG_PATH);
}
if (FFPROBE_PATH) {
    ffmpeg.setFfprobePath(FFPROBE_PATH);
}

export default ffmpeg;