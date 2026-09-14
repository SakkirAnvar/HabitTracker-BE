import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import router from "./routes/router.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/", router);

const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("DB Connection established successfully!");
    app.listen(PORT, () => {
      console.log(`Server is running successfully on the PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Connection Unsuccessfull", err?.message);
  });
