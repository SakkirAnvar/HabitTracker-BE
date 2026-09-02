import express from "express";
import { userAuth } from "../middlewares/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createReview, getAllReviews, getReview, updateReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/reviews", userAuth, asyncHandler(createReview));
router.get("/reviews/:date", userAuth, asyncHandler(getReview))
router.get("/reviews", userAuth, asyncHandler(getAllReviews))
router.patch("/reviews/:id", userAuth, asyncHandler(updateReview))

export default router;
