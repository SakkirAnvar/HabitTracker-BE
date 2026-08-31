import validator from "validator";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { jwtSign } from "./jwtValidation.js";

//Auth Validation
export const validateSignUpData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;

  if (!firstName?.trim() || !lastName?.trim()) {
    throw new Error("Firstname and Lastname are required ");
  }

  if (firstName?.trim().length < 3 || lastName?.trim().length < 1) {
    throw new Error("Name must contain atleast 3 characters");
  }

  if (!validator.isEmail(emailId) || "") {
    throw new Error("Email address is not valid");
  }

  if (!validator.isStrongPassword(password) || "") {
    throw new Error("Enter a strong password");
  }

  return true;
};

export const validateLoginUser = async (req, res) => {
  const { emailId, password } = req.body;

  if (!validator.isEmail(emailId)) {
    throw new Error("Enter a valid email address");
  }
  const user = await User.findOne({ emailId: emailId });
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const passwordHash = user.password;
  const inputPassword = password;

  const isValidPassword = await bcrypt.compare(inputPassword, passwordHash);
  if (isValidPassword) {
    await jwtSign(user, res);
  } else {
    throw new Error("Invalid Credentials");
  }

  return user;
};

//Habit Validation
export const validateHabitData = (req) => {
  const { habitName, category, type, target, unit, frequency } = req.body;

  if (!habitName?.trim()) {
    throw new Error("Habit name is required");
  }

  if (!category?.trim()) {
    throw new Error("Category is required");
  }

  if (!["boolean", "count", "duration"].includes(type)) {
    throw new Error("Invalid habit type");
  }

  if (target === undefined || target === null || target <= 0) {
    throw new Error("Target must be greater than 0");
  }

  if (!unit?.trim()) {
    throw new Error("Unit is required");
  }

  if (!["daily", "weekly", "monthly"].includes(frequency)) {
    throw new Error("Invalid frequency");
  }
};
