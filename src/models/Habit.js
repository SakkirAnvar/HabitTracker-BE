import mongoose, { Schema } from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
    },
    habitName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    target: {
      type: String,
    },
    unit: {
      type: String,
    },
    frequency: {
      type: String,
    },
    active: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
