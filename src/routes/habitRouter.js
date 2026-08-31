import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createHabit,
  deleteHabit,
  getAllHabits,
  getHabit,
  updateHabit,
} from "../controllers/habitController.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/habits", userAuth, asyncHandler(createHabit));
router.get("/habits", userAuth, asyncHandler(getAllHabits));
router.get("/habits/:id", userAuth, asyncHandler(getHabit));
router.patch("/habits/:id", userAuth, asyncHandler(updateHabit));
router.delete("/habits/:id", userAuth, asyncHandler(deleteHabit));

export default router;
