import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  changePassword,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  viewProfile,
} from "../controllers/authController.js";
import { userAuth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", asyncHandler(signupUser));
router.post("/login", asyncHandler(loginUser));
router.post("/logout", asyncHandler(logoutUser));
router.patch("/profile", userAuth, asyncHandler(updateUser));
router.get("/me", userAuth, asyncHandler(viewProfile));
router.patch("/changePassword", userAuth, asyncHandler(changePassword));

export default router;
