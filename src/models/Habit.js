import mongoose, { Schema } from "mongoose";

const habitSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    habitName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 25,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      required: true,
      enum: ["boolean", "count", "duration"],
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    frequency: {
      type: String,
      required: true,
      enum: ["daily", "weekly", "monthly"],
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// One habit name per user
habitSchema.index({ userId: 1, habitName: 1 }, { unique: true });

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;
