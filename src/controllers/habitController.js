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
  const habitId = req.params.id;
  const habit = await Habit.findOne(habitId);

  if (!habit) {
    res.status(401).json({
      status: false,
      message: "Something went wrong!",
    });
  }

  res.status(201).json({
    status: true,
    message: "Habit Retrieved Successfully!",
    data: habit,
  });
};

//Update Habit
export const updateHabit = async (req, res) => {
  const { habitName, category, type, target, unit, frequency, active } =
    req.body;

  const habitId = req.params.id;

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

//delete Habit
export const deleteHabit = async (req, res) => {
  const habitId = req.params.id;
  const user = req.user;

  const habit = await Habit.findOneAndDelete({
    _id: habitId,
    userId: user._id,
  });

  if (!habit) {
    res.status(404).json({
      status: false,
      message: "Habit not found or you are not authorized to delete it",
    });
  }

  res.status(201).json({
    status: true,
    message: "Habit Deleted Successfully",
  });
};
