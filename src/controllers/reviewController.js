import Review from "../models/Review.js";
import { validateReview } from "../utils/validate.js";

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
