import express from "express";

const app = express();

/**
 * Manually Modules
 */
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.config";
/**
 * Middleware
 */
import cookieParser from "cookie-parser";
import cors from "cors";

app.use(express.json()); // Handaling the Json data
app.use(express.urlencoded({ extended: true })); // Handaling the form data
app.use(cookieParser());
app.use(cors());

/**
 * DB connect
 */
connectDB();

app.get("/", (req, res) => {
  res.json({
    message: "Health Check complete",
  });
});

/**
 * Routes implementation
 */
import userRouter from "./router/user.router";
import adminRoute from "./router/admin.router";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
});
