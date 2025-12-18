import { Router } from "express";
/**
 * Controller modules
 */
import {
  userProfile,
  getAllMovies,
  searchMovie,
  bookMovie
  // BookTicket,
  // confirmBooking,
  // giveRatingAndReview,
} from "./userController";

import { Role } from "../RBAC/Role"
import { authorizeRole } from "../RBAC/roleAuthorize"

import { verifyToken } from "../auth/tokenVerify";

const userRouter = Router();


// Getting user profile
userRouter.route("/profile/:id").get(
  verifyToken,
  authorizeRole(Role.USER),
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
  authorizeRole(Role.USER),
  bookMovie
)

// booking movie tickets
// userRouter.route("/bookTicket").post(
//   verifyToken,
//   authorizeRole(Role.USER),
//   BookTicket
// );
// router.get("/test", (req: Request, res: Response)=>{
//   res.send("Test route working!")
// });

// Confirm Bookig Ticket
// router.patch("/confirm-booking/:bookingId", verifyToken, confirmBooking);

// Give Rating and Review to the movie
// router.post("/give-rating/:bookingId", verifyToken, giveRatingAndReview);
export default userRouter;
