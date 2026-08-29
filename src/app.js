import express from "express";
import "dotenv/config";
import connectDB from "./config/db.js";
import router from "./routes/authRouter.js";

const app = express();
app.use(express.json());

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
