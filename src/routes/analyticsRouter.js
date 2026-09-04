import express from "express";
import {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getHabitStreak,
  getCalendarAnalytics,
} from "../controllers/analyticsController.js";

import asyncHandler from "../utils/asyncHandler.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/analytics/daily", userAuth, asyncHandler(getDailyAnalytics));
router.get("/analytics/weekly", userAuth, asyncHandler(getWeeklyAnalytics));
router.get("/analytics/monthly", userAuth, asyncHandler(getMonthlyAnalytics));
router.get(
  "/analytics/habits/:habitId/streak",
  userAuth,
  asyncHandler(getHabitStreak),
);
router.get("/analytics/calendar", userAuth, asyncHandler(getCalendarAnalytics));

export default router;
