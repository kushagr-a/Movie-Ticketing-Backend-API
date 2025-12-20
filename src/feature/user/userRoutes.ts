import { Router } from "express";

// Controller modules
import {
  userProfile,
  getAllMovies,
  searchMovie,
  bookMovie,
  confirmBooking,
  userBookingHistory,
  userFeedBack,
} from "./userController";

import { Role } from "../RBAC/Role"
import { authorizeRole } from "../RBAC/roleAuthorize"
import { verifyToken } from "../auth/tokenVerify";

const userRouter = Router();


// Getting user profile
userRouter.route("/profile/:id").get(
  verifyToken,
  authorizeRole(Role.USER, Role.ADMIN, Role.MODERATOR),
  userProfile
)

// Get all movie by admin
userRouter.route("/allMovies").get(
  verifyToken,
  authorizeRole(Role.USER),
  getAllMovies
)

// search movie
userRouter.route("/searchMovie").get(
  verifyToken,
  authorizeRole(Role.USER),
  searchMovie
)

// book movie
userRouter.route("/bookMovie").post(
  verifyToken,
  authorizeRole(Role.USER, Role.ADMIN, Role.MODERATOR),
  bookMovie
)

// confirm booking
userRouter.route("/confirmBooking").patch(
  verifyToken,
  authorizeRole(Role.USER),
  confirmBooking
)

userRouter.route("/userBookingHistory").get(
  verifyToken,
  authorizeRole(Role.USER, Role.ADMIN, Role.MODERATOR),
  userBookingHistory
)

userRouter.route("/userFeedBack").post(
  verifyToken,
  authorizeRole(Role.USER),
  userFeedBack
)
export default userRouter;
