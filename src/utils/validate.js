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
export const validateGoal = (data, isUpdate = false) => {
  const {
    title,
    description,
    target,
    currentProgress,
    unit,
    startDate,
    deadLine,
  } = data;

  // Required fields for CREATE
  if (!isUpdate) {
    if (!title?.trim()) {
      throw new Error("Goal title is required");
    }

    if (target === undefined || target === null) {
      throw new Error("Goal target is required");
    }

    if (!startDate) {
      throw new Error("Goal start date is required");
    }

    if (!deadLine) {
      throw new Error("Goal deadline is required");
    }
  }

  // Title
  if (title !== undefined) {
    if (!title?.trim()) {
      throw new Error("Goal title is required");
    }

    if (title.trim().length < 2 || title.trim().length > 100) {
      throw new Error("Goal title must be between 2 and 100 characters");
    }
  }

  // Description
  if (description !== undefined) {
    if (typeof description !== "string" || description.trim().length > 200) {
      throw new Error("Description must be below 200 characters");
    }
  }

  // Target
  if (target !== undefined) {
    if (typeof target !== "number" || target <= 0) {
      throw new Error("Goal target must be greater than 0");
    }
  }

  // Current Progress
  if (currentProgress !== undefined) {
    if (typeof currentProgress !== "number" || currentProgress < 0) {
      throw new Error("Current progress cannot be negative");
    }
  }

  // Unit
  if (unit !== undefined) {
    if (typeof unit !== "string" || !unit.trim()) {
      throw new Error("Unit cannot be empty");
    }
  }

  // Start Date
  if (startDate !== undefined) {
    const start = new Date(startDate);

    if (isNaN(start.getTime())) {
      throw new Error("Invalid start date");
    }
  }

  // Deadline
  if (deadLine !== undefined) {
    const end = new Date(deadLine);

    if (isNaN(end.getTime())) {
      throw new Error("Invalid deadline");
    }
  }

  // Compare dates when both are provided
  if (startDate !== undefined && deadLine !== undefined) {
    const start = new Date(startDate);
    const end = new Date(deadLine);

    if (end <= start) {
      throw new Error("Deadline must be after start date");
    }
  }
};
