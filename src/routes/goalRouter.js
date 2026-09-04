import express from "express";
import { userAuth } from "../middlewares/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  addHabitToGoal,
  createGoal,
  deleteGoal,
  getAllGoal,
  getGoal,
  getGoalProgress,
  removeHabitFromGoal,
  updateGoal,
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/goals", userAuth, asyncHandler(createGoal));
router.get("/goals/:id", userAuth, asyncHandler(getGoal));
router.get("/goals", userAuth, asyncHandler(getAllGoal));
router.patch("/goals/:id", userAuth, asyncHandler(updateGoal));
router.delete("/goals/:id", userAuth, asyncHandler(deleteGoal));

//goal habit relationship
router.post(
  "/goals/:goalId/habits/:habitId",
  userAuth,
  asyncHandler(addHabitToGoal),
);

router.delete(
  "/goals/:goalId/habits/:habitId",
  userAuth,
  asyncHandler(removeHabitFromGoal),
);

//goal progress
router.get("/goals/:goalId/progress", userAuth, asyncHandler(getGoalProgress));

export default router;
