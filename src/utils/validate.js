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

//Goal validation
export const validateGoal = (req) => {
  const {
    title,
    description,
    target,
    currentProgress,
    unit,
    startDate,
    deadLine,
  } = req.body;

  if (!title?.trim()) {
    throw new Error("Goal title is required");
  }

  if (title.trim().length < 2 || title.trim().length > 100) {
    throw new Error("Goal title must be between 2 and 100 characters");
  }

  if (description && description.trim().length > 200) {
    throw new Error("Description must be below 200 characters");
  }

  if (
    target === undefined ||
    target === null ||
    typeof target !== "number" ||
    target <= 0
  ) {
    throw new Error("Goal target must be greater than 0");
  }

  if (
    currentProgress !== undefined &&
    (typeof currentProgress !== "number" || currentProgress < 0)
  ) {
    throw new Error("Current progress cannot be negative");
  }

  if (!startDate) {
    throw new Error("Goal start date is required");
  }

  if (!deadLine) {
    throw new Error("Goal deadLine is required");
  }

  const start = new Date(startDate);
  const end = new Date(deadLine);

  if (isNaN(start.getTime())) {
    throw new Error("Invalid start date");
  }

  if (isNaN(end.getTime())) {
    throw new Error("Invalid deadline");
  }

  if (end <= start) {
    throw new Error("Deadline must be after the start date");
  }
};
