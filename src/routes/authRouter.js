import express from "express";
import { validateLoginUser, validateSignUpData } from "../utils/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwtSign from "../utils/jwtValidation.js";

const router = express.Router();

//signup user
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    const savedUser = await user.save();

    await jwtSign(savedUser, res);

    res.status(201).send({
      status: true,
      message: "User Created Successfully",
      data: savedUser,
    });
  }),
);

//login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const userData = await validateLoginUser(req, res);

    res.status(201).send({
      status: true,
      message: "Logged In Successfully",
      data: userData,
    });
  }),
);

export default router;
