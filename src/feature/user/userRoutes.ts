import { Router } from "express";
import { Request, Response } from "express";
/**
 * Controller modules
 */
import {
  getAllMovies,
  searchMovie,
  BookTicket,
  // confirmBooking,
  // giveRatingAndReview,
} from "./userController";

import { verifyToken } from "../auth/tokenVerify";

const router = Router();

// Get all movie by admin
router.get("/all-movies", verifyToken, getAllMovies);

// search movie
router.get("/searchMovie", verifyToken, searchMovie);

// booking movie tickets
router.post("/book-ticket", verifyToken, BookTicket);
// router.get("/test", (req: Request, res: Response)=>{
//   res.send("Test route working!")
// });

// Confirm Bookig Ticket
// router.patch("/confirm-booking/:bookingId", verifyToken, confirmBooking);

// Give Rating and Review to the movie
// router.post("/give-rating/:bookingId", verifyToken, giveRatingAndReview);
export default router;
