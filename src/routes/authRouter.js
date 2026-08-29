import express from "express";
import validateSignUpDate from "../utils/validate.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwtSign from "../utils/jwtValidation.js";

const router = express.Router();

//signup user
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    validateSignUpDate(req);

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
      stastus: true,
      message: "User Created Successfully",
      data: savedUser,
    });
  }),
);

export default router;
