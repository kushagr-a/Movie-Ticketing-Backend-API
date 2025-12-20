// import { createClient } from "redis";

// export const redisClient = createClient({
//   url: "redis://localhost:6379", // local redis
// });

// redisClient.on("error", (err) => {
//   console.error("Redis error", err);
// });

// export const connectRedis = async () => {
//   if (!redisClient.isOpen) {
//     await redisClient.connect();
//     console.log(" Redis connected");
//   }
// };

import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit(); // graceful close
    console.log("Redis disconnected");
  }
};
