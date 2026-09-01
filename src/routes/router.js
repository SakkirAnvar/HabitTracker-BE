import express from "express";
import authRouter from "./authRouter.js";
import habitRouter from "./habitRouter.js";
import habitLogRouter from "../routes/habitLogRouter.js"

const router = express.Router();

router.use("/auth", authRouter);
router.use("/", habitRouter);
router.use("/", habitLogRouter)

export default router;
