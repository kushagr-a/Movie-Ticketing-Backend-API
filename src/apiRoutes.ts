import { Router } from "express";
import userRoutes from "./feature/user/user.router";
// import adminRoutes from "./feature/admin/admin.router";
import authRoutes from "./feature/auth/authRoutes";
import moderatorRoutes from "./feature/moderator/movieAddRoutes";

const apiRoutes = Router();

apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/user", userRoutes);
// apiRoutes.use("/admin", adminRoutes);
apiRoutes.use("/moderator", moderatorRoutes);

export default apiRoutes