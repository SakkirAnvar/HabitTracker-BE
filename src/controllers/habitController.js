import Habit from "../models/Habit.js";
import { validateHabitData } from "../utils/validate.js";

//Create Habit
export const createHabit = async (req, res) => {
  const { habitName, category, type, target, unit, frequency, active } =
    req.body;

  const user = req.user;

  validateHabitData(req);

  const habit = await new Habit({
    userId: user._id,
    habitName,
    category,
    type,
    target,
    unit,
    frequency,
    active,
  });

  const newHabit = await habit.save();

  res.status(201).json({
    status: true,
    message: "New Habit Added Successfully ",
    data: newHabit,
  });
};

//Fetch All Habit
