import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import connectDB, { disconnectDB } from "./db/db";
import { connectRedis, disconnectRedis } from "./utils/redis/redis";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect infra once
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    //  Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);

      server.close(async () => {
        console.log("HTTP server closed");

        //  CLOSE INFRA EXPLICITLY
        await disconnectRedis();
        await disconnectDB();

        // DO NOT FORCE EXIT IMMEDIATELY
        setTimeout(() => {
          process.exit(0);
        }, 100); // allow logs to flush
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
