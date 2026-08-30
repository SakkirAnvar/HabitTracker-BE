import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { createHabit, getAllHabits } from "../controllers/habitController.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/habits",userAuth, asyncHandler(createHabit));
router.get("/habits", userAuth, asyncHandler(getAllHabits))

export default router;
