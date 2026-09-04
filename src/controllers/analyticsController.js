import {
  calculateDailyAnalytics,
  calculateWeeklyAnalytics,
  calculateMonthlyAnalytics,
  calculateHabitStreak,
} from "../services/analyticsService.js";

import { isValidObjectId } from "mongoose";

//Get Daily Analytics

export const getDailyAnalytics = async (req, res) => {
  const userId = req.user._id;

  const date = req.query.date ? new Date(req.query.date) : new Date();

  if (isNaN(date.getTime())) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const analytics = await calculateDailyAnalytics(userId, date);

  res.status(200).json({
    status: true,
    message: "Daily analytics fetched successfully",
    data: analytics,
  });
};

//Get Weekly Analytics

export const getWeeklyAnalytics = async (req, res) => {
  const userId = req.user._id;

  const date = req.query.date ? new Date(req.query.date) : new Date();

  if (isNaN(date.getTime())) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const analytics = await calculateWeeklyAnalytics(userId, date);

  res.status(200).json({
    status: true,
    message: "Weekly analytics fetched successfully",
    data: analytics,
  });
};

//Get Monthly Analytics

export const getMonthlyAnalytics = async (req, res) => {
  const userId = req.user._id;

  const date = req.query.date ? new Date(req.query.date) : new Date();

  if (isNaN(date.getTime())) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const analytics = await calculateMonthlyAnalytics(userId, date);

  res.status(200).json({
    status: true,
    message: "Monthly analytics fetched successfully",
    data: analytics,
  });
};

//Get Habit Streak
export const getHabitStreak = async (req, res) => {
  const userId = req.user._id;
  const { habitId } = req.params;

  if (!isValidObjectId(habitId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid habit ID",
    });
  }

  const streak = await calculateHabitStreak(userId, habitId);

  return res.status(200).json({
    status: true,
    message: "Habit streak fetched successfully",
    data: streak,
  });
};
