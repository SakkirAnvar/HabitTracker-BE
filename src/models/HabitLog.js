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
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
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
