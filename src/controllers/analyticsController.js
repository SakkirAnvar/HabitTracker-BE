import {
  calculateDailyAnalytics,
  calculateWeeklyAnalytics,
  calculateMonthlyAnalytics,
  calculateHabitStreak,
  calculateCalendarAnalytics,
} from "../services/analyticsService.js";

import { isValidObjectId } from "mongoose";

const getTodayDateString = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidDateString = (date) => {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);

  const testDate = new Date(Date.UTC(year, month - 1, day));

  return (
    testDate.getUTCFullYear() === year &&
    testDate.getUTCMonth() === month - 1 &&
    testDate.getUTCDate() === day
  );
};

export const getDailyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const date = req.query.date || getTodayDateString();

    if (!isValidDateString(date)) {
      return res.status(400).json({
        status: false,
        message: "Invalid date. Expected YYYY-MM-DD",
      });
    }

    const analytics = await calculateDailyAnalytics(userId, date);

    return res.status(200).json({
      status: true,
      message: "Daily analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Daily analytics error:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch daily analytics",
    });
  }
};

export const getWeeklyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const date = req.query.date || getTodayDateString();

    if (!isValidDateString(date)) {
      return res.status(400).json({
        status: false,
        message: "Invalid date. Expected YYYY-MM-DD",
      });
    }

    const analytics = await calculateWeeklyAnalytics(userId, date);

    return res.status(200).json({
      status: true,
      message: "Weekly analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Weekly analytics error:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch weekly analytics",
    });
  }
};

export const getMonthlyAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const date = req.query.date || getTodayDateString();

    if (!isValidDateString(date)) {
      return res.status(400).json({
        status: false,
        message: "Invalid date. Expected YYYY-MM-DD",
      });
    }

    const analytics = await calculateMonthlyAnalytics(userId, date);

    return res.status(200).json({
      status: true,
      message: "Monthly analytics fetched successfully",
      data: analytics,
    });
  } catch (error) {
    console.error("Monthly analytics error:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch monthly analytics",
    });
  }
};

export const getHabitStreak = async (req, res) => {
  try {
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
  } catch (error) {
    console.error("Habit streak error:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch habit streak",
    });
  }
};

export const getCalendarAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();

    const year = req.query.year ? Number(req.query.year) : now.getFullYear();

    const month = req.query.month
      ? Number(req.query.month)
      : now.getMonth() + 1;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        status: false,
        message: "Invalid year",
      });
    }

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({
        status: false,
        message: "Invalid month",
      });
    }

    const calendar = await calculateCalendarAnalytics(userId, year, month);

    return res.status(200).json({
      status: true,
      message: "Calendar analytics fetched successfully",
      data: calendar,
    });
  } catch (error) {
    console.error("Calendar analytics error:", error);

    return res.status(500).json({
      status: false,
      message: error.message || "Failed to fetch calendar analytics",
    });
  }
};
