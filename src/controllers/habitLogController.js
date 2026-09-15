import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import mongoose from "mongoose";

export const createHabitLog = async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user._id;
  const { value, date } = req.body;

  if (value === undefined || typeof value !== "number" || value < 0) {
    return res.status(400).json({
      status: false,
      message: "Progress value must be a valid number",
    });
  }

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      status: false,
      message: "Invalid date. Expected YYYY-MM-DD",
    });
  }

  const habit = await Habit.findOne({
    _id: habitId,
    userId,
    active: true,
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found!",
    });
  }

  const completed =
    habit.type === "boolean" ? value >= 1 : value >= habit.target;

  const habitLog = await HabitLog.findOneAndUpdate(
    {
      habitId: habit._id,
      userId,
      date,
    },
    {
      $set: {
        value,
        completed,
      },
      $setOnInsert: {
        habitId: habit._id,
        userId,
        date,
      },
    },
    {
      new: true,
      upsert: true,
      returnDocument: "after",
      runValidators: true,
    },
  );

  return res.status(200).json({
    status: true,
    message: "Daily progress recorded successfully",
    data: habitLog,
  });
};

export const getAllHabitLog = async (req, res) => {
  const habitLogs = await HabitLog.find({
    userId: req.user._id,
  });

  if (habitLogs.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Habit Log Not Found",
    });
  }

  return res.status(200).json({
    status: true,
    message: "HabitLog retrieved successfully",
    data: habitLogs,
  });
};

export const getHabitLogByDate = async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const habitLogs = await HabitLog.find({
    userId,
    date,
  }).populate("habitId");

  if (habitLogs.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Habit Log not found for the given date",
    });
  }

  return res.status(200).json({
    status: true,
    message: `HabitLog retrieved successfully for ${date}`,
    data: habitLogs,
  });
};

export const updateHabitLog = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { value, date } = req.body;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      status: false,
      message: "Invalid habit log ID",
    });
  }

  if (value === undefined || typeof value !== "number" || value < 0) {
    return res.status(400).json({
      status: false,
      message: "Progress value must be a valid number",
    });
  }

  if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({
      status: false,
      message: "Invalid date. Expected YYYY-MM-DD",
    });
  }

  const habitLog = await HabitLog.findOne({
    _id: id,
    userId,
  });

  if (!habitLog) {
    return res.status(404).json({
      status: false,
      message: "Habit Log not found",
    });
  }

  const habit = await Habit.findOne({
    _id: habitLog.habitId,
    userId,
    active: true,
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  habitLog.value = value;

  if (date) {
    habitLog.date = date;
  }

  habitLog.completed =
    habit.type === "boolean" ? value >= 1 : value >= habit.target;

  const updatedHabitLog = await habitLog.save();

  return res.status(200).json({
    status: true,
    message: "Habit Log updated successfully",
    data: updatedHabitLog,
  });
};
