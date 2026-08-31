import mongoose, { Schema } from "mongoose";

const habitLogSchema = new Schema(
  {
    habitId: {
      type: Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

habitLogSchema.index(
  {
    habitId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

export const HabitLog = mongoose.model("HabitLog", habitLogSchema);

export default HabitLog;
