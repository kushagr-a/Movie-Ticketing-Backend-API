import app from "./app";
import connectDB from "./db/db.config";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

// Development mode
if (process.env.NODE_ENV !== "production") {
    app.get("/dbString", (req, res) => {
        return res.status(200).json({
            message: `DB mode: ${process.env.NODE_ENV}`,
            dbString: process.env.DB_STRING,
        })
    })
} else {
    console.log("DB mode: production")
}

// Connection monitoring status
let lastMonitoringTime = Date.now();
const MONITORING_INTERVAL = 60 * 60 * 1000; // 1 hour

const monitorConnection = () => {
    const now = Date.now();
    if (now - lastMonitoringTime >= MONITORING_INTERVAL) {
        console.log("Monitoring connection...");
        lastMonitoringTime = now;
    }
}
setInterval(monitorConnection, MONITORING_INTERVAL);

const startServer = async () => {
    try {
        const server = app.listen(process.env.PORT, () => {
            console.log(`Server running at http://localhost:${process.env.PORT}`);
        })

        // Graceful shutdown 
        process.on("SIGINT", () => {
            console.log("\nApp terminated...");
            server.close(() => {
                console.log("App terminated...");
                process.exit(0);
            })
        })

        process.on("SIGTERM", () => {
            console.log("\nApp terminated...");
            server.close(() => {
                console.log("App terminated...");
                process.exit(0);
            })
        })
        
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


startServer();