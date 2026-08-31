import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

export const createHabitLog = async (req, res) => {
  const habitId = req.params.id;
  const { value } = req.body;
  const user = req.user;

  if (value === undefined || typeof value !== "number" || value < 0) {
    return res.status(400).json({
      status: false,
      message: "Progress value must be a valid number",
    });
  }

  const habit = await Habit.findOne({
    _id: habitId,
    userId: user._id,
    active: true,
  });

  if (!habit) {
    res.status(404).json({
      status: false,
      message: "Habit not Found!",
    });
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const habitLog = await HabitLog.findOneAndUpdate(
    {
      habitId: habit._id,
      userId: req.user._id,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    },
    {
      value,
      completed: value >= habit.target,
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: true,
    message: "Daily progress recorded successfully",
    data: habitLog,
  });
};
