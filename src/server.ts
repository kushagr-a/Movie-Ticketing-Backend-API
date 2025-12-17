import app from "./app";
import dotenv from "dotenv";
dotenv.config();

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
            server.close(() => {
                console.log("Server closed...");
                process.exit(0);
            })
        })


    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}


startServer();