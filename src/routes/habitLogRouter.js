import express from "express";
import {
  createHabitLog,
  getAllHabitLog,
  getHabitLogByDate,
  updateHabitLog,
} from "../controllers/habitLogController.js";
import asyncHandler from "../utils/asyncHandler.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/habits-log/:id", userAuth, asyncHandler(createHabitLog));
router.get("/habits-log", userAuth, asyncHandler(getAllHabitLog));
router.get("/habits-log/:date", userAuth, asyncHandler(getHabitLogByDate));
router.patch("/habits-log/:id", userAuth, asyncHandler(updateHabitLog));

export default router;
