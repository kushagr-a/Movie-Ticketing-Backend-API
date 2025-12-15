import mongoose from "mongoose";

let idleTimer: NodeJS.Timeout | null = null;

export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) return // already connected
    if (mongoose.connection.readyState === 2) {
        await waitForConnection()
        return
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: process.env.DB_NAME,
            serverSelectionTimeoutMS: 5000, // wait 5 seconds before timing out
        })
        await waitForConnection()
        console.log("MongoDB connected")
    } catch (error: any) {
        console.log("MongoDB connection error", error.message)
        process.exit(1)
    }
}

const waitForConnection = () => {
    new Promise<void>((resolve, reject) => {
        if (mongoose.connection.readyState === 1) return resolve();
        mongoose.connection.once("connected", resolve);
        mongoose.connection.once("error", reject);
    })
}


export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 1) return;

    try {
        await mongoose.disconnect();
        console.log("MongoDB disconnected due to inactivity");
    } catch (error: any) {
        console.error("MongoDB disconnection error:", error.message);
    }
};

export const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);

    idleTimer = setTimeout(() => {
        disconnectDB();
    }, 60 * 1000); // 1 min idle → disconnect
};

export default connectDB