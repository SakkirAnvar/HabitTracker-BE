import {
  validateSignUpData,
  validateLoginUser,
  changePasswordValidation,
} from "../utils/validate.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { jwtSign } from "../utils/jwtValidation.js";

//signup user
export const signupUser = async (req, res) => {
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
};

//login user
export const loginUser = async (req, res) => {
  const userData = await validateLoginUser(req, res);

  res.status(201).send({
    status: true,
    message: "Logged In Successfully",
    data: userData,
  });
};

//logout user
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  return res.status(200).json({
    status: true,
    message: "Logged out successfully",
  });
};

//update Profile
export const updateUser = async (req, res) => {
  const { firstName, lastName, profilePhoto } = req.body;
  const _id = req.user._id;

  const updateData = {};

  if (firstName !== undefined) {
    updateData.firstName = firstName;
  }

  if (lastName !== undefined) {
    updateData.lastName = lastName;
  }

  if (profilePhoto !== undefined) {
    updateData.profilePhoto = profilePhoto;
  }

  const updatedUser = await User.findByIdAndUpdate({ _id }, updateData, {
    returnDocument: "after",
    runValidators: true,
  });

  if (!updatedUser) {
    res.status(404).json({
      status: false,
      message: "Failed to update profile",
    });
  }

  res.status(200).json({
    status: true,
    message: "User Profile Updated Successfully",
    data: updatedUser,
  });
};

//viewProfile
export const viewProfile = async (req, res) => {
  const user = req.user;

  if (!user) {
    res.status(404).json({
      status: false,
      message: "User not found!",
    });
  }

  res.status(200).json({
    status: true,
    message: "User Profile Retrieved Successfully",
    data: user,
  });
};

//changePassword
export const changePassword = async (req, res) => {
  const { _id, password } = req.user;
  const { currentPassword, newPassword } = req.body;

  changePasswordValidation(req, res);

  const passwordValid = await bcrypt.compare(currentPassword, password);
  if (!passwordValid) {
    return res.status(401).json({
      status: false,
      message: "Current password does not match",
    });
  }

  const samePassword = await bcrypt.compare(newPassword, password);

  if (samePassword) {
    return res.status(400).json({
      status: false,
      message: "New password must be different from current password",
    });
  }

  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  const updatedPassword = await User.findByIdAndUpdate(
    { _id },
    { password: newHashedPassword },
    { returnDocument: "after", runValidators: true },
  ).select("-password");

  if (!updatedPassword) {
    return res.status(404).json({
      status: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    status: true,
    message: "Password Changed Successfully",
    data: updatedPassword,
  });
};
