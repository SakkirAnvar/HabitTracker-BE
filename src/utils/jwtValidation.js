import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

const jwtSign = async (user, res) => {
  const userId = user._id;
  const token = await jwt.sign({ userId }, jwtSecret, {
    expiresIn: "7d",
  });
  //cookie
  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600000),
  });
};

export default jwtSign;
