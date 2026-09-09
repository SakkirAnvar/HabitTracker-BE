import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";
import mongoose from "mongoose";

//createHabitLog
export const createHabitLog = async (req, res) => {
  const habitId = req.params.id;
  const { value } = req.body;
  const userId = req.user._id;

  if (value === undefined || typeof value !== "number" || value < 0) {
    return res.status(400).json({
      status: false,
      message: "Progress value must be a valid number",
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

  // Store the daily date as UTC midnight
  const today = new Date();
  const dateString = today.toISOString().split("T")[0];
  const habitDate = new Date(`${dateString}T00:00:00.000Z`);

  const tomorrow = new Date(habitDate);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const habitLog = await HabitLog.findOneAndUpdate(
    {
      habitId: habit._id,
      userId,
      date: {
        $gte: habitDate,
        $lt: tomorrow,
      },
    },
    {
      $set: {
        value,
        completed: value >= habit.target,
      },
      $setOnInsert: {
        habitId: habit._id,
        userId,
        date: habitDate,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    },
  );

  return res.status(200).json({
    status: true,
    message: "Daily progress recorded successfully",
    data: habitLog,
  });
};

//getAllHabitLog
export const getAllHabitLog = async (req, res) => {
  const user = req.user;
  const habitLogs = await HabitLog.find({ userId: req.user._id });

  if (habitLogs.length === 0) {
    return res.status(404).json({
      status: false,
      message: "Habit Log Not Found",
    });
  }

  res.status(200).json({
    status: true,
    message: "HabitLog retrieved successfully",
    data: habitLogs,
  });
};

//getHabitLogByDate
export const getHabitLogByDate = async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  const habitLogDate = new Date(`${date}T00:00:00.000Z`);

  if (isNaN(habitLogDate.getTime())) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const nextDate = new Date(habitLogDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  const habitLogs = await HabitLog.find({
    userId,
    date: {
      $gte: habitLogDate,
      $lt: nextDate,
    },
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
  const { value } = req.body;

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
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  habitLog.value = value;
  habitLog.completed = value >= habit.target;

  const updatedHabitLog = await habitLog.save();

  return res.status(200).json({
    status: true,
    message: "Habit Log updated successfully",
    data: updatedHabitLog,
  });
};
