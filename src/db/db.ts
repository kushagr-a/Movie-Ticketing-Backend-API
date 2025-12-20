import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI not defined");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,          // connection pool
      minPoolSize: 2,
    });

    isConnected = true;
    console.log("MongoDB connected");

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
      isConnected = false;
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;

  await mongoose.connection.close();
  console.log("MongoDB connection closed");
};

export default connectDB;
