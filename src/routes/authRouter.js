import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import { loginUser, signupUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", asyncHandler(signupUser));
router.post("/login", asyncHandler(loginUser));

export default router;
