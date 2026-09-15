import Habit from "../models/Habit.js";
import { calculateHabitStreak } from "../services/analyticsService.js";
import { validateHabitData, validateHabitFilters } from "../utils/validate.js";

export const createHabit = async (req, res) => {
  validateHabitData(req);

  const {
    habitName,
    description,
    category,
    type,
    target,
    unit,
    frequency,
    scheduledDays,
    scheduledDates,
    active,
  } = req.body;

  const user = req.user;

  const existingHabit = await Habit.findOne({
    userId: user._id,
    habitName: habitName.trim(),
  });

  if (existingHabit) {
    return res.status(409).json({
      status: false,
      message: "Habit already exists",
    });
  }

  const habit = new Habit({
    userId: user._id,
    habitName: habitName.trim(),
    description,
    category,
    type,
    target,
    unit,
    frequency,
    scheduledDates,
    scheduledDays,
    active,
  });

  const newHabit = await habit.save();

  res.status(201).json({
    status: true,
    message: "New Habit Added Successfully",
    data: newHabit,
  });
};

export const getAllHabits = async (req, res) => {
  const user = req.user;
  const id = user._id;

  validateHabitFilters(req.query);

  const { search, category, active, frequency, date } = req.query;

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50);

  const skip = (page - 1) * limit;

  const filter = {
    userId: id,
  };

  if (search) {
    filter.habitName = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (category) {
    filter.category = {
      $regex: `^${category.trim()}$`,
      $options: "i",
    };
  }

  if (active !== undefined) {
    filter.active = active === "true";
  }

  if (frequency) {
    filter.frequency = frequency;
  }

  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);

    const endDate = new Date(startDate);

    endDate.setUTCDate(endDate.getUTCDate() + 1);

    filter.createdAt = {
      $gte: startDate,
      $lt: endDate,
    };
  }

  const [habits, totalHabits] = await Promise.all([
    Habit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),

    Habit.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalHabits / limit);

  if (page > totalPages && totalPages > 0) {
    return res.status(400).json({
      status: false,
      message: "Requested page does not exist",
    });
  }

  const habitsWithStreak = await Promise.all(
    habits.map(async (habit) => {
      try {
        const streak = await calculateHabitStreak(id, habit._id);

        return {
          ...habit,
          streak: streak.currentStreak,
          longestStreak: streak.longestStreak,
        };
      } catch (error) {
        console.error(
          `Failed to calculate streak for habit ${habit._id}:`,
          error,
        );

        return {
          ...habit,
          streak: 0,
          longestStreak: 0,
        };
      }
    }),
  );

  res.status(200).json({
    status: true,
    message:
      totalHabits === 0
        ? "No Habits Found"
        : "Habit data retrieved Successfully",

    data: habitsWithStreak,

    pagination: {
      currentPage: page,
      totalPages,
      totalHabits,
      limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
};

export const getHabit = async (req, res) => {
  const habitId = req.params.id;

  const habit = await Habit.findById(habitId);

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Habit Retrieved Successfully!",
    data: habit,
  });
};

export const updateHabit = async (req, res) => {
  const {
    habitName,
    category,
    description,
    type,
    target,
    unit,
    frequency,
    scheduledDates,
    scheduledDays,
    active,
  } = req.body;

  const habitId = req.params.id;

  const updatedHabit = await Habit.findByIdAndUpdate(
    habitId,
    {
      habitName,
      category,
      description,
      type,
      target,
      unit,
      frequency,
      scheduledDates,
      scheduledDays,
      active,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedHabit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Habit Updated Successfully",
    data: updatedHabit,
  });
};

export const toggleHabitStatus = async (req, res) => {
  const habitId = req.params.id;

  const habit = await Habit.findOne({
    _id: habitId,
    userId: req.user._id,
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found or you are not authorized",
    });
  }

  habit.active = !habit.active;

  const updatedHabit = await habit.save();

  res.status(200).json({
    status: true,
    message: updatedHabit.active
      ? "Habit activated successfully"
      : "Habit deactivated successfully",
    data: updatedHabit,
  });
};

export const deleteHabit = async (req, res) => {
  const habitId = req.params.id;
  const user = req.user;

  const habit = await Habit.findOneAndDelete({
    _id: habitId,
    userId: user._id,
  });

  if (!habit) {
    return res.status(404).json({
      status: false,
      message: "Habit not found or you are not authorized to delete it",
    });
  }

  res.status(200).json({
    status: true,
    message: "Habit Deleted Successfully",
  });
};
