import Habit from "../models/Habit.js";
import HabitLog from "../models/HabitLog.js";

const CATEGORIES = ["spiritual", "skills", "physical", "personal"];

// DATE HELPERS
const getDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const getStartOfDay = (date) => {
  const result = new Date(date);

  result.setHours(0, 0, 0, 0);

  return result;
};

const getEndOfDay = (date) => {
  const result = new Date(date);

  result.setHours(23, 59, 59, 999);

  return result;
};

// HABIT SCHEDULING
const isHabitScheduled = (habit, date) => {
  const currentDate = getStartOfDay(date);
  const createdDate = getStartOfDay(habit.createdAt);

  // Habit should not be counted before it was created
  if (currentDate < createdDate) {
    return false;
  }

  // Daily

  if (habit.frequency === "daily") {
    return true;
  }

  // Weekly

  if (habit.frequency === "weekly") {
    return currentDate.getDay() === createdDate.getDay();
  }

  // Monthly

  if (habit.frequency === "monthly") {
    return currentDate.getDate() === createdDate.getDate();
  }

  return false;
};

// CALCULATE LOG COMPLETION

const calculateLogCompletion = (habit, log) => {
  if (!log) {
    return 0;
  }

  // Boolean Habit

  if (habit.type === "boolean") {
    return log.completed ? 100 : 0;
  }

  // Count / Duration Habit

  if (habit.type === "count" || habit.type === "duration") {
    if (!habit.target || habit.target <= 0) {
      return log.completed ? 100 : 0;
    }

    const value = Number(log.value) || 0;

    return Math.min(Math.round((value / habit.target) * 100), 100);
  }

  return 0;
};

// DAILY ANALYTICS

export const calculateDailyAnalytics = async (userId, date = new Date()) => {
  const day = getStartOfDay(date);
  const endOfDay = getEndOfDay(day);

  const dateString = getDateString(day);

  // Get active habits

  const habits = await Habit.find({
    userId,
    active: true,
    createdAt: {
      $lte: endOfDay,
    },
  }).lean();

  // Get logs for this day

  const logs = await HabitLog.find({
    userId,
    date: {
      $gte: day,
      $lte: endOfDay,
    },
  }).lean();

  // Create log lookup map

  const logMap = new Map();

  logs.forEach((log) => {
    logMap.set(log.habitId.toString(), log);
  });

  // Overall statistics

  let totalExpected = 0;
  let totalCompleted = 0;

  // Category statistics

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

  //Individual habit statistics

  const habitStats = [];

  // Process habits

  for (const habit of habits) {
    //Check whether habit is scheduled today

    if (!isHabitScheduled(habit, day)) {
      continue;
    }

    //Find today's log

    const log = logMap.get(habit._id.toString());

    // Calculate completion

    const completion = calculateLogCompletion(habit, log);

    const completed = completion >= 100;

    /*
    |--------------------------------------------------------------------------
    | Overall
    |--------------------------------------------------------------------------
    */

    totalExpected += 1;

    if (completed) {
      totalCompleted += 1;
    }

    /*
    |--------------------------------------------------------------------------
    | Category
    |--------------------------------------------------------------------------
    */

    const category = habit.category?.toLowerCase();

    if (CATEGORIES.includes(category)) {
      categoryStats[category].expected += 1;

      if (completed) {
        categoryStats[category].completed += 1;
      }
    }
    /*
    |--------------------------------------------------------------------------
    | Individual habit data
    |--------------------------------------------------------------------------
    */

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

  /*
  |--------------------------------------------------------------------------
  | Category percentages
  |--------------------------------------------------------------------------
  */

  CATEGORIES.forEach((category) => {
    const stats = categoryStats[category];

    stats.percentage =
      stats.expected === 0
        ? 0
        : Math.round((stats.completed / stats.expected) * 100);
  });

  /*
  |--------------------------------------------------------------------------
  | Overall percentage
  |--------------------------------------------------------------------------
  */

  const overall =
    totalExpected === 0
      ? 0
      : Math.round((totalCompleted / totalExpected) * 100);

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    date: dateString,

    overall,

    completed: totalCompleted,

    expected: totalExpected,

    categories: categoryStats,

    habits: habitStats,
  };
};

/*
|--------------------------------------------------------------------------
| RANGE ANALYTICS
|--------------------------------------------------------------------------
*/

export const calculateRangeAnalytics = async (userId, startDate, endDate) => {
  const start = getStartOfDay(startDate);
  const end = getEndOfDay(endDate);

  const dailyAnalytics = [];

  const currentDate = new Date(start);

  /*
  |--------------------------------------------------------------------------
  | Calculate every day
  |--------------------------------------------------------------------------
  */

  while (currentDate <= end) {
    const daily = await calculateDailyAnalytics(userId, new Date(currentDate));

    dailyAnalytics.push(daily);

    currentDate.setDate(currentDate.getDate() + 1);
  }

  /*
  |--------------------------------------------------------------------------
  | Days containing at least one scheduled habit
  |--------------------------------------------------------------------------
  */

  const daysWithHabits = dailyAnalytics.filter((day) => day.expected > 0);

  /*
  |--------------------------------------------------------------------------
  | Overall range percentage
  |--------------------------------------------------------------------------
  */

  const overall =
    daysWithHabits.length === 0
      ? 0
      : Math.round(
          daysWithHabits.reduce((sum, day) => sum + day.overall, 0) /
            daysWithHabits.length,
        );

  /*
  |--------------------------------------------------------------------------
  | Category percentages
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | Return
  |--------------------------------------------------------------------------
  */

  return {
    startDate: getDateString(start),

    endDate: getDateString(end),

    overall,

    categories,

    daily: dailyAnalytics,
  };
};

/*
|--------------------------------------------------------------------------
| WEEKLY ANALYTICS
|--------------------------------------------------------------------------
|
| Monday → Sunday
|
|--------------------------------------------------------------------------
*/

export const calculateWeeklyAnalytics = async (userId, date = new Date()) => {
  const current = getStartOfDay(date);

  const dayOfWeek = current.getDay();

  /*
  |--------------------------------------------------------------------------
  | Find Monday
  |--------------------------------------------------------------------------
  */

  const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(current);

  monday.setDate(monday.getDate() + difference);

  /*
  |--------------------------------------------------------------------------
  | Find Sunday
  |--------------------------------------------------------------------------
  */

  const sunday = new Date(monday);

  sunday.setDate(sunday.getDate() + 6);

  /*
  |--------------------------------------------------------------------------
  | Calculate range
  |--------------------------------------------------------------------------
  */

  return calculateRangeAnalytics(userId, monday, sunday);
};

/*
|--------------------------------------------------------------------------
| MONTHLY ANALYTICS
|--------------------------------------------------------------------------
*/

export const calculateMonthlyAnalytics = async (userId, date = new Date()) => {
  const year = date.getFullYear();

  const month = date.getMonth();

  /*
  |--------------------------------------------------------------------------
  | First day of month
  |--------------------------------------------------------------------------
  */

  const firstDay = new Date(year, month, 1);

  /*
  |--------------------------------------------------------------------------
  | Last day of month
  |--------------------------------------------------------------------------
  */

  const lastDay = new Date(year, month + 1, 0);

  /*
  |--------------------------------------------------------------------------
  | Calculate range
  |--------------------------------------------------------------------------
  */

  return calculateRangeAnalytics(userId, firstDay, lastDay);
};

//HABIT STREAK
export const calculateHabitStreak = async (userId, habitId) => {
  /*
  |--------------------------------------------------------------------------
  | Find habit
  |--------------------------------------------------------------------------
  */

  const habit = await Habit.findOne({
    _id: habitId,
    userId,
  }).lean();

  if (!habit) {
    throw new Error("Habit not found");
  }

  /*
  |--------------------------------------------------------------------------
  | Get all logs
  |--------------------------------------------------------------------------
  */

  const logs = await HabitLog.find({
    userId,
    habitId,
  })
    .sort({
      date: -1,
    })
    .lean();

  /*
  |--------------------------------------------------------------------------
  | Store completed dates
  |--------------------------------------------------------------------------
  */

  const completedDates = new Set();

  logs.forEach((log) => {
    if (log.completed) {
      completedDates.add(getDateString(new Date(log.date)));
    }
  });

  /*
  |--------------------------------------------------------------------------
  | Current streak
  |--------------------------------------------------------------------------
  */

  let currentStreak = 0;

  const today = getStartOfDay(new Date());

  let checkDate = new Date(today);

  /*
  |--------------------------------------------------------------------------
  | If today is scheduled but not completed,
  | start checking from yesterday.
  |--------------------------------------------------------------------------
  */

  const todayScheduled = isHabitScheduled(habit, today);

  const todayString = getDateString(today);

  if (todayScheduled && !completedDates.has(todayString)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  /*
  |--------------------------------------------------------------------------
  | Find consecutive scheduled completions
  |--------------------------------------------------------------------------
  */

  while (true) {
    /*
    |--------------------------------------------------------------------------
    | Don't count days before habit existed
    |--------------------------------------------------------------------------
    */

    const habitCreatedDate = getStartOfDay(habit.createdAt);

    if (checkDate < habitCreatedDate) {
      break;
    }

    /*
    |--------------------------------------------------------------------------
    | Skip days where habit wasn't scheduled
    |--------------------------------------------------------------------------
    */

    if (!isHabitScheduled(habit, checkDate)) {
      checkDate.setDate(checkDate.getDate() - 1);

      continue;
    }

    const dateString = getDateString(checkDate);

    /*
    |--------------------------------------------------------------------------
    | Stop when scheduled day wasn't completed
    |--------------------------------------------------------------------------
    */

    if (!completedDates.has(dateString)) {
      break;
    }

    currentStreak++;

    checkDate.setDate(checkDate.getDate() - 1);
  }

  /*
  |--------------------------------------------------------------------------
  | Longest streak
  |--------------------------------------------------------------------------
  */

  const sortedDates = [...completedDates].sort();

  let longestStreak = 0;

  let runningStreak = 0;

  let previousDate = null;

  for (const dateString of sortedDates) {
    const currentDate = new Date(`${dateString}T00:00:00`);

    /*
    |--------------------------------------------------------------------------
    | Ignore dates before habit creation
    |--------------------------------------------------------------------------
    */

    const habitCreatedDate = getStartOfDay(habit.createdAt);

    if (currentDate < habitCreatedDate) {
      continue;
    }

    /*
    |--------------------------------------------------------------------------
    | First completed date
    |--------------------------------------------------------------------------
    */

    if (!previousDate) {
      runningStreak = 1;
    } else {
      /*
      |--------------------------------------------------------------------------
      | Difference in days
      |--------------------------------------------------------------------------
      */

      const difference = Math.round(
        (currentDate - previousDate) / (1000 * 60 * 60 * 24),
      );

      /*
      |--------------------------------------------------------------------------
      | Daily habit
      |--------------------------------------------------------------------------
      */

      if (habit.frequency === "daily" && difference === 1) {
        runningStreak++;
      } else if (habit.frequency === "weekly" && difference === 7) {
        /*
      |--------------------------------------------------------------------------
      | Weekly habit
      |--------------------------------------------------------------------------
      */
        runningStreak++;
      } else if (habit.frequency === "monthly") {
        /*
      |--------------------------------------------------------------------------
      | Monthly habit
      |--------------------------------------------------------------------------
      */
        const previousMonth = previousDate.getMonth();

        const previousYear = previousDate.getFullYear();

        const currentMonth = currentDate.getMonth();

        const currentYear = currentDate.getFullYear();

        const monthDifference =
          (currentYear - previousYear) * 12 + (currentMonth - previousMonth);

        if (monthDifference === 1) {
          runningStreak++;
        } else {
          runningStreak = 1;
        }
      } else {
        /*
      |--------------------------------------------------------------------------
      | Invalid consecutive date
      |--------------------------------------------------------------------------
      */
        runningStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, runningStreak);

    previousDate = currentDate;
  }

  /*
  |--------------------------------------------------------------------------
  | Return streak
  |--------------------------------------------------------------------------
  */

  return {
    habitId,

    currentStreak,

    longestStreak,
  };
};

export const calculateCalendarAnalytics = async (userId, year, month) => {
  // month is 1-12
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  const calendar = [];

  const currentDate = new Date(firstDay);

  while (currentDate <= lastDay) {
    const dailyAnalytics = await calculateDailyAnalytics(
      userId,
      new Date(currentDate),
    );

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

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    year,
    month,
    daysInMonth: lastDay.getDate(),
    calendar,
  };
};
