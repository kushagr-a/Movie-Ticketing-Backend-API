import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../auth/users.model";
import { createError } from "../../utils/createError.utils";
import { MovieModel } from "../booking/movie.model";
import mongoose from "mongoose";
import { BookingModel } from "../booking/booking.model";
import { sendMail } from "../../utils/mail/sendMail";

// // Controller for Register User
// export const registerUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       throw createError(400, "All feilds are required");
//     }

//     // Check if user already exist or not
//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       throw createError(409, "Email already exist");
//     }

//     // Hash password
//     const hasedPassword = await bcrypt.hash(password, 12);

//     // Create a new user
//     const newUser = await UserModel.create({
//       name,
//       email,
//       password: hasedPassword,
//       role: "user", // Default role
//     });

//     // saving the new user
//     await newUser.save();

//     // Convert to plain object and remove password
//     const user = newUser.toObject() as any;
//     delete user.password;

//     // Genrate JWT token
//     const token = jwt.sign(
//       { id: newUser._id, role: newUser.role },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "7d" }
//     );

//     // Set token in cookie
//     res.cookie("token", token, {
//       httpOnly: true, // prevent access from JS on browser
//       secure: process.env.NODE_ENV === "production", // only over HTTPS in production
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     // Response to the client
//     res.status(200).json({
//       message: "User registered successfully",
//       user,
//       token,
//     });
//   } catch (error: any) {
//     res
//       .status(error.statusCode || 500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// };

// // Controller for Login User
// export const loginUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       throw createError(400, "All feilds are required");
//     }

//     // Find User
//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       throw createError(401, "Invalid credentials");
//     }

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       throw createError(401, "Invalid credentials");
//     }

//     // Genrate JWT token
//     const token = jwt.sign(
//       {
//         id: user._id,
//         role: user.role,
//       },
//       process.env.JWT_SECRET as string,
//       { expiresIn: "7d" }
//     );

//     // Set token in cookie
//     res.cookie("token", token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

//     // send response
//     const userData = user.toObject() as any;
//     delete userData.password;

//     res.status(200).json({
//       message: "Login successful",
//       user: userData,
//       token,
//     });
//   } catch (error: any) {
//     res
//       .status(error.statusCode || 500)
//       .json({ message: error.message || "Internal server Error" });
//   }
// };

// // LogOut User
// export const logoutUser = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });

//     res.status(200).json({
//       message: "Logged out successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Something went wrong during logout",
//     });
//   }
// };

// Get all movies those upload by admin for users
export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: movies.length,
      movies,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch movies",
      error: error.message,
    });
  }
};

// BookTicket by user
export const BookTicket = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { movieId, seatNumbers } = req.body;

    // validate inputs
    if (
      !movieId ||
      !seatNumbers ||
      !Array.isArray(seatNumbers) ||
      seatNumbers.length === 0
    ) {
      throw createError(
        400,
        "Movie ID and at least one seat number is  required."
      );
    }

    // check valid movie Id
    if (!mongoose.Types.ObjectId.isValid(movieId)) {
      throw createError(400, "Invalid movie ID");
    }

    // Check if movie exists
    const movie = await MovieModel.findById(movieId);
    if (!movie) {
      throw createError(404, "Movie not found");
    }

    // create booking
    const booking = await BookingModel.create({
      user: userId,
      movie: movieId,
      seatNumbers,
      bookingTime: new Date(), // current time
    });

    res.status(201).json({
      success: true,
      message: "Ticket booked successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Something went wrong while booking",
    });
  }
};

// Confirm booking thicket
export const confirmBooking = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      throw createError(400, "Invalid Booking ID");
    }

    const booking = await BookingModel.findById(bookingId)
      .populate("user", "fullname email")
      .populate("movie", "name genre time rating");

    if (!booking) {
      throw createError(404, "Booking not found");
    }

    if (booking.confirmed) {
      throw createError(400, "Booking already confirmed");
    }

    // Confirm booking
    booking.confirmed = true;
    await booking.save();

    // Send mail if user and movie populated
    const user = booking.user as any;
    const movie = booking.movie as any;

    const timeString = movie?.time || "N/A";

    await sendMail({
      to: user.email,
      subject: "🎟️ Your Ticket is Confirmed!",
      html: `
        <h3>Hi ${user?.fullname || "User"},</h3>
        <p>Your ticket for <strong>${movie?.name || "Movie"
        }</strong> is confirmed!</p>
        <p>🪑 Seats: ${booking?.seatNumbers?.join(", ")}</p>
        <p>📍 Date: ${new Date(booking?.bookingTime).toDateString()}</p>
        <p>⏰ Time: ${timeString}</p>
        <br/>
        <p>Enjoy your show! 🍿</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message || "Something went wrong while confirming the booking",
    });
  }
};

// Giving Rating and Review to the movie
export const giveRatingAndReview = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const bookingId = req.params.bookingId;
    const { rating, review } = req.body;

    // Input validation
    if (!bookingId || typeof rating !== "number" || !review) {
      throw createError(400, "Booking ID, rating and review are required");
    }

    // Check rating range
    if (rating < 1 || rating > 5) {
      throw createError(400, "Booking ID, rating and review are required");
    }

    // Find booking
    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      throw createError(404, "Booking not found");
    }

    if (!booking.confirmed) {
      throw createError(400, "Only confirmed bookings can be reviewed");
    }

    // check if already rated or reviewed
    if (booking.rating || booking.review) {
      throw createError(400, "You have already rated or reviewed this booking");
    }

    // Add rating and review
    booking.rating = rating;
    booking.review = review;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Thank you for your feedback!",
      data: {
        movie: booking.movie,
        rating: booking.rating,
        review: booking.review,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.message ||
        "Something went wrong while submitting your rating and review",
    });
  }
};
