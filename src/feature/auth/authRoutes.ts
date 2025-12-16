import { Router } from "express";
import { register, login, logout } from "./authController"

const authRoutes = Router();

authRoutes.route("/register").post(register);
authRoutes.route("/login").post(login);
authRoutes.route("/logout").post(logout);


export default authRoutes
