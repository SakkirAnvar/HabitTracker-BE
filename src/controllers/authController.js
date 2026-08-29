import { validateSignUpData, validateLoginUser } from "../utils/validate.js";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwtSign from "../utils/jwtValidation.js";

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
