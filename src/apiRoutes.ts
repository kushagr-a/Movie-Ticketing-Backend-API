import { Router } from "express";
import userRoutes from "./feature/user/user.router";
import adminRoutes from "./feature/admin/admin.router";

const apiRoutes = Router();

apiRoutes.use("/user", userRoutes);
apiRoutes.use("/admin", adminRoutes);

export default apiRoutes