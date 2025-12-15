import express from "express";
const app = express();

// Manually Modules
import cookieParser from "cookie-parser";
import cors from "cors";

// Manually Middleware
app.use(express.json()); // Handaling the Json data
app.use(express.urlencoded({ extended: true })); // Handaling the form data
app.use(cookieParser());
app.use(cors());

// Health Check
app.get("/", (req, res) => {
  res.json({
    message: "Health Check complete",
  });
});

// Main Routes
import apiRoutes from "./apiRoutes";
app.use("/api", apiRoutes);

export default app