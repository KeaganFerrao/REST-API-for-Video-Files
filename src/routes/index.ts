import { Router } from "express";
import videoRouter from "./video";

const router = Router();

router.use('/video', videoRouter);

export default router;
