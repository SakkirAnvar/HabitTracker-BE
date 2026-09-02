import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    mood: {
      type: String,
      trim: true,
    },

    energy: {
      type: Number,
      min: 1,
      max: 10,
    },

    wentWell: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    improvement: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    tomorrowPriority: {
      type: String,
      required:true,
      trim: true,
      maxlength: 200,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    userId: 1,
    date: 1,
  },
  {
    unique: true,
  },
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
