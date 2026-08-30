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
export const getAllHabits = async (req, res) => {
  const user = req.user;

  const habits = await Habit.find({ userId: user._id });

  res.status(201).json({
    status: true,
    message: "Habit data retrived Successfully",
    data: habits,
  });
};

//get Single Habit
export const getHabit = async (req, res) => {
  const user = req.user;
  const habitId = req.params;
};

//Update Habit
export const updateHabit = async (req, res) => {
  const { habitName, category, type, target, unit, frequency, active } =
    req.body;

  const habitId  = req.params.id;

  const updatedHabit = await Habit.findByIdAndUpdate(
    habitId,
    {
      habitName,
      category,
      type,
      target,
      unit,
      frequency,
      active,
    },
    { returnDocument: "after", runValidators: true },
  );

  if (!updateHabit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  res.status(201).json({
    status: true,
    message: "Habit Updated Successfully",
    data: updatedHabit,
  });
};
