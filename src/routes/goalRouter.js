import express from "express";
import { userAuth } from "../middlewares/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createGoal,
  deleteGoal,
  getAllGoal,
  getGoal,
  updateGoal,
} from "../controllers/goalController.js";

const router = express.Router();

router.post("/goals", userAuth, asyncHandler(createGoal));
router.get("/goals/:id", userAuth, asyncHandler(getGoal));
router.get("/goals", userAuth, asyncHandler(getAllGoal));
router.patch("/goals/:id", userAuth, asyncHandler(updateGoal));
router.delete("/goals/:id", userAuth, asyncHandler(deleteGoal));

export default router;
