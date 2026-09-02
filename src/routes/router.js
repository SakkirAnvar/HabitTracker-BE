import express from "express";
import authRouter from "./authRouter.js";
import habitRouter from "./habitRouter.js";
import habitLogRouter from "../routes/habitLogRouter.js";
import goalRouter from "../routes/goalRouter.js";
import reviewRouter from "../routes/reviewRouter.js";
import analyticsRouetr from "../routes/analyticsRouter.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/", habitRouter);
router.use("/", habitLogRouter);
router.use("/", goalRouter);
router.use("/", reviewRouter);
router.use("/", analyticsRouetr)

export default router;
