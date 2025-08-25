import { Router } from "express";

/**
 * Controller modules
 */
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  addMovie,
  getAllMovies,
  updateMovie,
  getAllBookings,
  getaAllReviews,
} from "../controller/admin.controller";

/**
 * auth middleware
 */
import { isAdmin } from "../middleware/isAdmin.middleware";

const router = Router();

//  Register admin
router.post("/register-admin", registerAdmin);

// Login admin
router.post("/login-admin", loginAdmin);

// Login admin
router.post("/logout-admin", logoutAdmin);

// Add movie — protected by isAdmin
router.post("/add-movie", isAdmin, addMovie);

// get all movies added by admin
router.get("/all-movies", isAdmin, getAllMovies);

// update movie
router.put("/update-movie/:id", isAdmin, updateMovie);

// get all booked movies by user
router.get("/booked-movie", isAdmin, getAllBookings);

// get all reviews
router.get("/all-reviews", isAdmin, getaAllReviews);

export default router;
