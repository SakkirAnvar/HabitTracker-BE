import express from "express"
import { createHabitLog, getAllHabitLog } from "../controllers/habitLogController.js";
import asyncHandler from "../utils/asyncHandler.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router()

router.post("/habits/:id/log", userAuth, asyncHandler(createHabitLog));
router.get("/habits-log", userAuth, asyncHandler(getAllHabitLog))

export default router;