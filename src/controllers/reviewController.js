import Review from "../models/Review.js";
import { validateReview } from "../utils/validate.js";

//createReview
export const createReview = async (req, res) => {
  const { date, mood, energy, wentWell, improvement, tomorrowPriority, notes } =
    req.body;
  const userId = req.user._id;

  validateReview(req);

  const existingReview = await Review.findOne({
    userId,
    date: new Date(date),
  });

  if (existingReview) {
    return res.status(409).json({
      status: false,
      message: "Daily review already exists for this date",
    });
  }

  const review = new Review({
    userId: userId,
    date,
    mood,
    energy,
    wentWell,
    improvement,
    tomorrowPriority,
    notes,
  });

  const newReview = await review.save();

  res.status(201).json({
    status: true,
    message: "Daily Review Created Successfully",
    data: newReview,
  });
};

//getReview by date
export const getReview = async (req, res) => {
  const userId = req.user._id;
  const { date } = req.params;

  const reviewDate = new Date(`${date}T00:00:00.000Z`);

  if (isNaN(reviewDate.getTime())) {
    return res.status(400).json({
      status: false,
      message: "Invalid date",
    });
  }

  const review = await Review.findOne({
    userId,
    date: reviewDate,
  });

  if (!review) {
    return res.status(404).json({
      status: false,
      message: "No review found for this date",
    });
  }

  res.status(200).json({
    status: true,
    message: "Review fetched successfully",
    data: review,
  });
};

//getAllReviews
export const getAllReviews = async (req, res) => {
  const userId = req.user._id;

  const reviews = await Review.find({ userId }).sort({ date: -1 });

  if (reviews.length === 0) {
    return res.status(404).json({
      status: false,
      message: "No Reviews Found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Reviews Data Fetched Successfully",
    data: reviews,
  });
};

//updateReview
export const updateReview = async (req, res) => {
  const userId = req.user._id;
  const reviewId = req.params.id;

  const {
    mood,
    energy,
    wentWell,
    improvement,
    tomorrowPriority,
    notes,
  } = req.body;

  // Validate update data
  validateReview(req, true);

  const updateData = {};

  if (mood !== undefined) {
    updateData.mood = mood;
  }

  if (energy !== undefined) {
    updateData.energy = energy;
  }

  if (wentWell !== undefined) {
    updateData.wentWell = wentWell;
  }

  if (improvement !== undefined) {
    updateData.improvement = improvement;
  }

  if (tomorrowPriority !== undefined) {
    updateData.tomorrowPriority = tomorrowPriority;
  }

  if (notes !== undefined) {
    updateData.notes = notes;
  }

  const updatedReview = await Review.findOneAndUpdate(
    {
      _id: reviewId,
      userId,
    },
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  );

  if (!updatedReview) {
    return res.status(404).json({
      status: false,
      message: "Review not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
};