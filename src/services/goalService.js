import Goal from "../models/Goal.js";
import HabitLog from "../models/HabitLog.js";

export const calculateGoalProgress = async (userId, goalId) => {
  const goal = await Goal.findOne({
    _id: goalId,
    userId,
  }).lean();

  if (!goal) {
    throw new Error("Goal not found");
  }

  if (!goal.habitIds || goal.habitIds.length === 0) {
    return {
      goalId: goal._id,
      target: goal.target,
      currentprogress: 0,
      progressPercentage: 0,
      status: "active",
      completedHabitLogs: 0,
    };
  }

  const completedHabitLogs = await HabitLog.find({
    userId,
    habitId: {
      $in: goal.habitIds,
    },
    completed: true,
  }).lean();

  const currentProgress = completedHabitLogs.length;

  const progressPercentage =
    goal.target > 0
      ? Math.min(Math.round((currentProgress / goal.target) * 100), 100)
      : 0;

  const status = currentProgress >= goal.target ? "completed" : "active";

  return {
    goalId: goal._id,
    target: goal.target,
    currentProgress,
    progressPercentage,
    status,
    completedHabitLogs: currentProgress,
  };
};
