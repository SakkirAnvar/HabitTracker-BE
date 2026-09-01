import express from "express";
import { userAuth } from "../middlewares/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createGoal,
  getAllGoal,
  getGoal,
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/goals", userAuth, asyncHandler(createGoal));
router.get("/goals/:id", userAuth, asyncHandler(getGoal));
router.get("/goals", userAuth, asyncHandler(getAllGoal));

export default router;
