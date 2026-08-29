import User from "../models/User.js";
import { jwtVerify } from "../utils/jwtValidation.js";

export const userAuth = async (req, res, next) => {
  try {
    const decodedToken = await jwtVerify(req, res);

    const { _id } = decodedToken;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User Not Found!");
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err?.message);
  }
};
