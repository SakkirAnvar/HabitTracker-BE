import Goal from "../models/Goal.js";
import { validateGoal } from "../utils/validate.js";

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

  const goal = new Goal({
    userId: user._id,
    title,
    description,
    target,
    currentProgress: currentProgress ?? 0,
    unit,
    startDate,
    deadLine,
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
  const user = req.user;
  const goalId = req.params.id;
  const goal = await Goal.findOne({ _id: goalId, userId: user._id });

  if (!goal) {
    res.status(404).json({
      status: false,
      message: "Goal not found!",
    });
  }

  res.status(201).json({
    status: true,
    message: "Goal retreived successfully",
    data: goal,
  });
};

//getAllGoal
export const getAllGoal = async (req, res) => {
  const user = req.user;
  const goals = await Goal.find({ userId: user._id });

  if (goals.length === 0) {
    res.status(404).json({
      status: false,
      message: "No Goals found!",
    });
  }

  res.status(201).json({
    status: true,
    message: "Goals Retreived successfully",
    data: goals,
  });
};
