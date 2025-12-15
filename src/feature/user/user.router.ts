import { Router } from "express";
import { Request, Response } from "express";
/**
 * Controller modules
 */
import {
  registerUser,
  loginUser,
  logoutUser,
  getAllMovies,
  BookTicket,
  confirmBooking,
  giveRatingAndReview,
} from "./user.controller";

import { isAuthenticated } from "../../middleware/isAuthorized.middleware";

const router = Router();

// Register Router
router.post("/register", registerUser);

// Login User
router.post("/login", loginUser);

// Logout User
router.post("/logout", logoutUser);

// Get all movie by admin
router.get("/all-movies", isAuthenticated, getAllMovies);

// booking movie tickets
router.post("/book-ticket", isAuthenticated, BookTicket);
// router.get("/test", (req: Request, res: Response)=>{
//   res.send("Test route working!")
// });

// Confirm Bookig Ticket
router.patch("/confirm-booking/:bookingId", isAuthenticated, confirmBooking);

// Give Rating and Review to the movie
router.post("/give-rating/:bookingId", isAuthenticated, giveRatingAndReview);
export default router;
