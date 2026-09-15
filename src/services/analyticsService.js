import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

const CATEGORIES = ["spiritual", "skills", "physical", "personal"];

const isValidDateString = (date) => {
  if (typeof date !== "string") {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
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

const dateToString = (date) => {
  const year = date.getUTCFullYear();

  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTodayDateString = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const parseDateString = (date) => {
  const [year, month, day] = date.split("-").map(Number);

  return {
    year,
    month,
    day,
  };
};

const addDays = (dateString, amount) => {
  const { year, month, day } = parseDateString(dateString);

  const date = new Date(Date.UTC(year, month - 1, day));

  date.setUTCDate(date.getUTCDate() + amount);

  return dateToString(date);
};

const getDayOfWeek = (dateString) => {
  const { year, month, day } = parseDateString(dateString);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

const getDayOfMonth = (dateString) => {
  return parseDateString(dateString).day;
};

const getMonthNumber = (dateString) => {
  return parseDateString(dateString).month;
};

const getYear = (dateString) => {
  return parseDateString(dateString).year;
};

const differenceInDays = (firstDate, secondDate) => {
  const first = parseDateString(firstDate);
  const second = parseDateString(secondDate);

  const firstUTC = Date.UTC(first.year, first.month - 1, first.day);

  const secondUTC = Date.UTC(second.year, second.month - 1, second.day);

  return Math.round((firstUTC - secondUTC) / (1000 * 60 * 60 * 24));
};

const isHabitScheduled = (habit, dateString) => {
  if (!isValidDateString(dateString)) {
    return false;
  }

  const createdDate = dateToString(new Date(habit.createdAt));

  if (dateString < createdDate) {
    return false;
  }

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly") {
    return getDayOfWeek(dateString) === getDayOfWeek(createdDate);
  }

  if (habit.frequency === "monthly") {
    return getDayOfMonth(dateString) === getDayOfMonth(createdDate);
  }

  if (habit.frequency === "custom") {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const currentDay = dayNames[getDayOfWeek(dateString)];

    return Boolean(habit.scheduledDays?.includes(currentDay));
  }

  return false;
};

const calculateLogCompletion = (habit, log) => {
  if (!log) {
    return 0;
  }

  if (habit.type === "boolean") {
    return log.completed ? 100 : 0;
  }

  if (
    habit.type === "count" ||
    habit.type === "numeric" ||
    habit.type === "duration"
  ) {
    if (!habit.target || habit.target <= 0) {
      return log.completed ? 100 : 0;
    }

    const value = Number(log.value) || 0;

    return Math.min(Math.round((value / habit.target) * 100), 100);
  }

  if (habit.type === "rating") {
    const value = Number(log.value) || 0;

    return Math.min(Math.round((value / 5) * 100), 100);
  }

  return 0;
};

export const calculateDailyAnalytics = async (userId, date) => {
  const dateString = date || getTodayDateString();

  if (!isValidDateString(dateString)) {
    throw new Error("Invalid analytics date");
  }

  const { year, month, day } = parseDateString(dateString);

  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

  const habits = await Habit.find({
    userId,
    active: true,
    createdAt: {
      $lte: endOfDay,
    },
  }).lean();

  const logs = await HabitLog.find({
    userId,
    date: dateString,
  }).lean();

  const logMap = new Map();

  logs.forEach((log) => {
    logMap.set(log.habitId.toString(), log);
  });

  let totalExpected = 0;
  let totalCompleted = 0;

  const categoryStats = {
    spiritual: {
      expected: 0,
      completed: 0,
      percentage: 0,
    },

    skills: {
      expected: 0,
      completed: 0,
      percentage: 0,
    },

    physical: {
      expected: 0,
      completed: 0,
      percentage: 0,
    },

    personal: {
      expected: 0,
      completed: 0,
      percentage: 0,
    },
  };

  const habitStats = [];

  for (const habit of habits) {
    if (!isHabitScheduled(habit, dateString)) {
      continue;
    }

    const log = logMap.get(habit._id.toString());

    const completion = calculateLogCompletion(habit, log);

    const completed = completion >= 100;

    totalExpected += 1;

    if (completed) {
      totalCompleted += 1;
    }

    const category = habit.category?.toLowerCase();

    if (CATEGORIES.includes(category)) {
      categoryStats[category].expected += 1;

      if (completed) {
        categoryStats[category].completed += 1;
      }
    }

    habitStats.push({
      habitId: habit._id,
      name: habit.habitName,
      category: habit.category,
      type: habit.type,
      target: habit.target,
      unit: habit.unit,
      frequency: habit.frequency,
      completion,
      completed,
      value: log?.value ?? 0,
    });
  }

  CATEGORIES.forEach((category) => {
    const stats = categoryStats[category];

    stats.percentage =
      stats.expected === 0
        ? 0
        : Math.round((stats.completed / stats.expected) * 100);
  });

  const overall =
    totalExpected === 0
      ? 0
      : Math.round((totalCompleted / totalExpected) * 100);

  return {
    date: dateString,

    overall,

    completed: totalCompleted,

    expected: totalExpected,

    categories: categoryStats,

    habits: habitStats,
  };
};

export const calculateRangeAnalytics = async (userId, startDate, endDate) => {
  const start = startDate;
  const end = endDate;

  if (!isValidDateString(start) || !isValidDateString(end)) {
    throw new Error("Invalid analytics range");
  }

  const dailyAnalytics = [];

  let currentDate = start;

  while (currentDate <= end) {
    const daily = await calculateDailyAnalytics(userId, currentDate);

    dailyAnalytics.push(daily);

    currentDate = addDays(currentDate, 1);
  }

  const daysWithHabits = dailyAnalytics.filter((day) => day.expected > 0);

  const overall =
    daysWithHabits.length === 0
      ? 0
      : Math.round(
          daysWithHabits.reduce((sum, day) => sum + day.overall, 0) /
            daysWithHabits.length,
        );

  const categories = {};

  CATEGORIES.forEach((category) => {
    const categoryDays = dailyAnalytics.filter(
      (day) => day.categories[category].expected > 0,
    );

    categories[category] =
      categoryDays.length === 0
        ? 0
        : Math.round(
            categoryDays.reduce(
              (sum, day) => sum + day.categories[category].percentage,
              0,
            ) / categoryDays.length,
          );
  });

  return {
    startDate: start,
    endDate: end,

    overall,

    categories,

    daily: dailyAnalytics,
  };
};

export const calculateWeeklyAnalytics = async (userId, date) => {
  const currentDate = date || getTodayDateString();

  if (!isValidDateString(currentDate)) {
    throw new Error("Invalid weekly analytics date");
  }

  const dayOfWeek = getDayOfWeek(currentDate);

  const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = addDays(currentDate, difference);

  const sunday = addDays(monday, 6);

  return calculateRangeAnalytics(userId, monday, sunday);
};

export const calculateMonthlyAnalytics = async (userId, date) => {
  const currentDate = date || getTodayDateString();

  if (!isValidDateString(currentDate)) {
    throw new Error("Invalid monthly analytics date");
  }

  const year = getYear(currentDate);

  const month = getMonthNumber(currentDate);

  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;

  const lastDayDate = new Date(Date.UTC(year, month, 0));

  const lastDay = dateToString(lastDayDate);

  return calculateRangeAnalytics(userId, firstDay, lastDay);
};

export const calculateHabitStreak = async (userId, habitId) => {
  const habit = await Habit.findOne({
    _id: habitId,
    userId,
    active: true,
  }).lean();

  if (!habit) {
    throw new Error("Habit not found");
  }

  const logs = await HabitLog.find({
    userId,
    habitId,
    completed: true,
  })
    .sort({ date: 1 })
    .lean();

  const completedDates = new Set();

  logs.forEach((log) => {
    if (!log.date) return;

    const logDate = new Date(log.date);

    if (Number.isNaN(logDate.getTime())) {
      return;
    }

    const dateString = logDate.toISOString().split("T")[0];

    completedDates.add(dateString);
  });

  const now = new Date();

  const today = now.toISOString().split("T")[0];

  const createdDate = new Date(habit.createdAt);

  const createdDateString = createdDate.toISOString().split("T")[0];

  const parseDate = (dateString) => {
    return new Date(`${dateString}T00:00:00.000Z`);
  };

  const addDays = (dateString, amount) => {
    const date = parseDate(dateString);

    date.setUTCDate(date.getUTCDate() + amount);

    return date.toISOString().split("T")[0];
  };

  const getDayOfWeek = (dateString) => {
    return parseDate(dateString).getUTCDay();
  };

  const getDayOfMonth = (dateString) => {
    return parseDate(dateString).getUTCDate();
  };

  const getYear = (dateString) => {
    return parseDate(dateString).getUTCFullYear();
  };

  const getMonth = (dateString) => {
    return parseDate(dateString).getUTCMonth();
  };

  const isScheduled = (dateString) => {
    if (dateString < createdDateString) {
      return false;
    }

    if (habit.frequency === "daily") {
      return true;
    }

    if (habit.frequency === "weekly") {
      return getDayOfWeek(dateString) === getDayOfWeek(createdDateString);
    }

    if (habit.frequency === "monthly") {
      return getDayOfMonth(dateString) === getDayOfMonth(createdDateString);
    }

    if (habit.frequency === "custom") {
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];

      const currentDay = dayNames[getDayOfWeek(dateString)];

      return Boolean(habit.scheduledDays?.includes(currentDay));
    }

    return false;
  };

  let currentStreak = 0;

  let checkDate = today;

  if (isScheduled(today) && !completedDates.has(today)) {
    checkDate = addDays(checkDate, -1);
  }

  while (true) {
    if (checkDate < createdDateString) {
      break;
    }

    if (!isScheduled(checkDate)) {
      checkDate = addDays(checkDate, -1);

      continue;
    }

    if (!completedDates.has(checkDate)) {
      break;
    }

    currentStreak += 1;

    checkDate = addDays(checkDate, -1);
  }

  const sortedDates = [...completedDates].sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate = null;

  for (const currentDate of sortedDates) {
    if (currentDate < createdDateString) {
      continue;
    }

    if (!previousDate) {
      runningStreak = 1;
    } else {
      if (habit.frequency === "daily") {
        const difference = Math.round(
          (parseDate(currentDate) - parseDate(previousDate)) /
            (1000 * 60 * 60 * 24),
        );

        if (difference === 1) {
          runningStreak += 1;
        } else {
          runningStreak = 1;
        }
      } else if (habit.frequency === "weekly") {
        const difference = Math.round(
          (parseDate(currentDate) - parseDate(previousDate)) /
            (1000 * 60 * 60 * 24),
        );

        if (difference === 7) {
          runningStreak += 1;
        } else {
          runningStreak = 1;
        }
      } else if (habit.frequency === "monthly") {
        const monthDifference =
          (getYear(currentDate) - getYear(previousDate)) * 12 +
          (getMonth(currentDate) - getMonth(previousDate));

        if (monthDifference === 1) {
          runningStreak += 1;
        } else {
          runningStreak = 1;
        }
      } else if (habit.frequency === "custom") {
        let nextScheduledDate = addDays(previousDate, 1);

        let foundNext = false;

        for (let i = 0; i < 31; i++) {
          if (isScheduled(nextScheduledDate)) {
            if (nextScheduledDate === currentDate) {
              foundNext = true;
            }

            break;
          }

          nextScheduledDate = addDays(nextScheduledDate, 1);
        }

        if (foundNext) {
          runningStreak += 1;
        } else {
          runningStreak = 1;
        }
      } else {
        runningStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, runningStreak);

    previousDate = currentDate;
  }

  return {
    habitId,
    currentStreak,
    longestStreak,
  };
};

export const calculateCalendarAnalytics = async (userId, year, month) => {
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;

  const lastDayDate = new Date(Date.UTC(year, month, 0));

  const lastDay = dateToString(lastDayDate);

  const calendar = [];

  let currentDate = firstDay;

  while (currentDate <= lastDay) {
    const dailyAnalytics = await calculateDailyAnalytics(userId, currentDate);

    let status = "none";

    if (dailyAnalytics.expected > 0) {
      if (dailyAnalytics.overall === 100) {
        status = "completed";
      } else if (dailyAnalytics.overall >= 50) {
        status = "partial";
      } else {
        status = "missed";
      }
    }

    calendar.push({
      date: dailyAnalytics.date,

      status,

      completion: dailyAnalytics.overall,

      completed: dailyAnalytics.completed,

      expected: dailyAnalytics.expected,
    });

    currentDate = addDays(currentDate, 1);
  }

  return {
    year,
    month,

    daysInMonth: lastDayDate.getUTCDate(),

    calendar,
  };
};
