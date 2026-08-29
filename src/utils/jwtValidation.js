import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET;

export const jwtSign = async (user, res) => {
  const userId = user._id;
  const token = await jwt.sign({ userId }, jwtSecret, {
    expiresIn: "7d",
  });
  //cookie
  res.cookie("token", token, {
    expires: new Date(Date.now() + 8 * 3600000),
  });
};

export const jwtVerify = async (req, res) => {
  const cookies = req.cookies;
  const { token } = cookies;

  if (!token) {
    res.status(401).send({ message: "Please Login!" });
  }

  const decodedToken = await jwt.verify(token, jwtSecret);

  return decodedToken;
};
