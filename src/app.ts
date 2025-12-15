import express from "express";
const app = express();

// Manually Modules
import cookieParser from "cookie-parser";
import cors from "cors";

// Manually Middleware
app.use(express.json()); // Handaling the Json data
app.use(express.urlencoded({ extended: true })); // Handaling the form data
app.use(cookieParser());

// CORS Middleware
app.use(cors({
  origin: process.env.CORS_oRIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Lazy DB connection middleware
import { skipDb } from "./utils/SkipRoutes/skipDb"
import { resetIdleTimer } from "./db/db.config"
app.use(async (req, res, next) => {
  try {
    if (!skipDb(req.path)) {
      // connect to DB
      await connectDB() // connect only when needed
      resetIdleTimer()// reset idle timer
    }
    next()
  } catch (error: any) {
    console.error("MongoDB connection error:", error.message);
    return res.status(500).json({
      error: "Database connection error"
    })
  }

})

// Health monitoring route
app.get("/health", (req, res) => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    status: true,
    message: "Health Check complete",
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

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: true,
    message: "Health Check complete",
  });
});

// Main Routes
import apiRoutes from "./apiRoutes";
import connectDB from "./db/db.config";
app.use("/api", apiRoutes);

export default app