import mongoose, { Schema } from "mongoose";

const goalSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    currentProgress: {
      type: Number,
      default: 0,
      min: 0,
    },

    unit: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadLine: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "completed", "cancelled", "expired"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;
