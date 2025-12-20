import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import apiRoutes from "./apiRoutes";

const app = express();

// Security headers
app.use(helmet());

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Health check
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


//  API Routes
app.use("/api", apiRoutes);


export default app;
