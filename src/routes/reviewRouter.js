import express from "express";
import { userAuth } from "../middlewares/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { createReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/reviews", userAuth, asyncHandler(createReview));

export default router;
