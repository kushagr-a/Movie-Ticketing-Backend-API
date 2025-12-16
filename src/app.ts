import express from "express";
import apiRoutes from "./apiRoutes";
import connectDB from "./db/db";
const app = express();

// Core Modules
import cookieParser from "cookie-parser";
import cors from "cors";

// Core Middleware
app.use(express.json()); // Handling JSON data
app.use(express.urlencoded({ extended: true })); // Handling form data
app.use(cookieParser()); // Parse cookies

// CORS Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Lazy DB Connection Middleware
import { skipDb } from "./utils/SkipRoutes/skipDb";
import { resetIdleTimer } from "./db/db";

app.use(async (req, res, next) => {
  try {
    if (!skipDb(req.path)) {
      // Connect to DB only when needed
      await connectDB();
      resetIdleTimer(); // Reset idle timer to prevent disconnection
    }
    next();
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    return res.status(500).json({
      error: "Database connection error"
    });
  }
});

// Health Monitoring Route 
app.get("/health", (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    status: true,
    message: "Health check complete",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    },
    cpu: cpuUsage,
  });
});


// Main API Routes
app.use("/api", apiRoutes);

export default app;