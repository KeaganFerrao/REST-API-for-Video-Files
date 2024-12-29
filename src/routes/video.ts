import { VideoMiddleware } from "../middleware/video";
import { Router } from "express";
import { VideoController } from "../controllers/video";
import { TrimVideoValidationRules, IdValidationRules, ValidateReqParams, UUIDValidationRules, MergeVideosValidationRules } from "../middleware/video/validator";
import { UserMiddleware } from "../middleware/user";
import { VideoSequelizeService } from "../services/video";
import { UserSequelizeService } from "../services/user";
import { LocalFileSystemUtils } from "../utility/video";
import { ConsoleLogger } from "../setup/logger";
import { FfmpegUtils } from "../utility/ffmpeg";

const logger = new ConsoleLogger();
const videoService = new VideoSequelizeService();
const fileSystemUtils = new LocalFileSystemUtils();
const videoUtils = new FfmpegUtils(logger);
const videoController = new VideoController(videoService, fileSystemUtils, videoUtils, logger);
const videoMiddleware = new VideoMiddleware(videoService, videoUtils, logger);

const userService = new UserSequelizeService();
const userMiddleware = new UserMiddleware(userService, logger);

const router = Router();

router.post('/upload', userMiddleware.ValidateUserAPIKey, videoMiddleware.ValidateVideoUpload({ fileName: 'video' }), videoController.UploadVideo);
router.patch('/trim/:id', userMiddleware.ValidateUserAPIKey, TrimVideoValidationRules(), ValidateReqParams, videoController.TrimVideo);
router.post('/merge', userMiddleware.ValidateUserAPIKey, MergeVideosValidationRules(), ValidateReqParams, videoController.MergeVideos);
router.get('/generate-link/:id', userMiddleware.ValidateUserAPIKey, IdValidationRules(), ValidateReqParams, videoController.GenerateLink);
router.get('/download/:id', UUIDValidationRules(), ValidateReqParams, videoController.DownloadVideo);
router.get('/list', videoController.GetVideoList);

export default router;
