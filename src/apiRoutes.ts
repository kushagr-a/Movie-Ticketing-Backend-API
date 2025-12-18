import { Router } from "express";
import userRoutes from "./feature/user/userRoutes";
import adminRoutes from "./feature/admin/admin.router";
import authRoutes from "./feature/auth/authRoutes";
import moderatorRoutes from "./feature/moderator/movieAddRoutes";
// import bookingRoutes from "./feature/booking/movieBooking/bookingRoutes";

const apiRoutes = Router();

apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/user", userRoutes);
apiRoutes.use("/moderator", moderatorRoutes);
// apiRoutes.use("/booking", bookingRoutes);

export default apiRoutes