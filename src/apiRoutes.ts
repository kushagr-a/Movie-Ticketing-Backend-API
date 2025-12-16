import { Router } from "express";
import userRoutes from "./feature/user/user.router";
import adminRoutes from "./feature/admin/admin.router";
import authRoutes from "./feature/auth/authRoutes";

const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/user", userRoutes);
apiRoutes.use("/admin", adminRoutes);

export default apiRoutes