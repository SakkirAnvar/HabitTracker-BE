import mongoose from "mongoose";
import Goal from "../models/Goal.js";
import { validateGoal } from "../utils/validate.js";
import Habit from "../models/Habit.js";
import { calculateGoalProgress } from "../services/goalService.js";

//createGoal
export const createGoal = async (req, res) => {
  const user = req.user;
  const {
    title,
    description,
    target,
    currentProgress,
    unit,
    startDate,
    deadLine,
  } = req.body;
  validateGoal(req);

  const existingGoal = await Goal.findOne({
    userId: user._id,
    title: title.trim(),
  });

  if (existingGoal) {
    return res.status(409).json({
      status: false,
      message: "Goal already exists",
    });
  }

  const progress = currentProgress ?? 0;
  const status = progress >= target ? "completed" : "active";

  const goal = new Goal({
    userId: user._id,
    title,
    description,
    target,
    currentProgress: currentProgress ?? 0,
    unit,
    startDate,
    deadLine,
    status,
    habitIds: [],
  });

  const newGoal = await goal.save();

  res.status(201).json({
    status: true,
    message: "Goal set successfully",
    data: newGoal,
  });
};

//getGoal
export const getGoal = async (req, res) => {
  const userId = req.user._id;
  const goalId = req.params.id;

  if (!mongoose.isValidObjectId(goalId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid goal ID",
    });
  }

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  }).populate("habitIds");

  if (!goal) {
    return res.status(404).json({
      status: false,
      message: "Goal not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Goal retrieved successfully",
    data: goal,
  });
};

//getAllGoal
export const getAllGoal = async (req, res) => {
  const userId = req.user._id;

  const goals = await Goal.find({
    userId,
  })
    .populate("habitIds")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    message: "Goals retrieved successfully",
    data: goals,
  });
};

//updateGoal
export const updateGoal = async (req, res) => {
  const userId = req.user._id;
  const goalId = req.params.id;

  if (!mongoose.isValidObjectId(goalId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid goal ID",
    });
  }

  validateGoal(req.body, true);

  /*
  |--------------------------------------------------------------------------
  | Find user's goal
  |--------------------------------------------------------------------------
  */

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  });

  if (!goal) {
    return res.status(404).json({
      status: false,
      message: "Goal not found",
    });
  }

  const {
    title,
    description,
    target,
    currentProgress,
    unit,
    startDate,
    deadline,
  } = req.body;

  /*
  |--------------------------------------------------------------------------
  | Update only provided fields
  |--------------------------------------------------------------------------
  */

  if (title !== undefined) {
    goal.title = title.trim();
  }

  if (description !== undefined) {
    goal.description = description;
  }

  if (target !== undefined) {
    goal.target = target;
  }

  if (currentProgress !== undefined) {
    goal.currentProgress = currentProgress;
  }

  if (unit !== undefined) {
    goal.unit = unit;
  }

  if (startDate !== undefined) {
    goal.startDate = startDate;
  }

  if (deadline !== undefined) {
    goal.deadLine = deadline;
  }

  const updatedGoal = await goal.save();

  res.status(200).json({
    status: true,
    message: "Goal updated successfully",
    data: updatedGoal,
  });
};

//deleteGoal
export const deleteGoal = async (req, res) => {
  const goalId = req.params.id;
  const userId = req.user._id;

  const goal = await Goal.findOneAndDelete({
    _id: goalId,
    userId,
  });

  if (!goal) {
    return res.status(404).json({
      status: false,
      message: "Goal not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Goal deleted successfully",
  });
};

// add habit to goal
export const addHabitToGoal = async (req, res) => {
  const userId = req.user._id;

  const { goalId, habitId } = req.params;

  if (!mongoose.isValidObjectId(goalId) || !mongoose.isValidObjectId(habitId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid goal ID or habit ID",
    });
  }

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  });

  if (!goal) {
    return res.status(404).json({
      status: false,
      message: "Goal not found",
    });
  }

  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  const alreadyAdded = goal.habitIds.some(
    (id) => id.toString() === habitId.toString(),
  );

  if (alreadyAdded) {
    return res.status(409).json({
      status: false,
      message: "Habit already added to this goal",
    });
  }

  goal.habitIds.push(habitId);

  const updatedGoal = await goal.save();

  await updatedGoal.populate("habitIds");

  res.status(200).json({
    status: true,
    message: "Habit added to goal successfully",
    data: updatedGoal,
  });
};

//removeHabitFromGoal
export const removeHabitFromGoal = async (req, res) => {
  const userId = req.user._id;

  const { goalId, habitId } = req.params;

  // Validate IDs

  if (!mongoose.isValidObjectId(goalId) || !mongoose.isValidObjectId(habitId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid goal ID or habit ID",
    });
  }

  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  });

  if (!goal) {
    return res.status(404).json({
      status: false,
      message: "Goal not found",
    });
  }

  //Check relationship

  const habitExists = goal.habitIds.some(
    (id) => id.toString() === habitId.toString(),
  );

  if (!habitExists) {
    return res.status(404).json({
      status: false,
      message: "Habit is not attached to this goal",
    });
  }

  //Remove habit

  goal.habitIds = goal.habitIds.filter(
    (id) => id.toString() !== habitId.toString(),
  );

  const updatedGoal = await goal.save();

  await updatedGoal.populate("habitIds");

  res.status(200).json({
    status: true,
    message: "Habit removed from goal successfully",
    data: updatedGoal,
  });
};

//getGoalProgress
export const getGoalProgress = async (req, res) => {
  const userId = req.user._id;
  const { goalId } = req.params;
  if (!mongoose.isValidObjectId(goalId)) {
    return res.status(400).json({
      status: false,
      message: "Invalid goal Id",
    });
  }

  const progress = await calculateGoalProgress(userId, goalId);

  return res.status(200).json({
    status: true,
    message: "Goal Progress fetched successfully",
    data: progress,
  });
};
