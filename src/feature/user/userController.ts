import { Request, Response } from "express";
import { createError } from "../../utils/createError.utils";
import { MovieModel } from "../booking/movie/movieModel";
import mongoose from "mongoose";
import { BookingModel } from "../booking/movieBooking/bookingModel";
import { sendMail } from "../../utils/mail/sendMail";

// Get all movies those upload by admin for users
export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const movies = await MovieModel.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      // total: movies.length,
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

export const searchMovie = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    // Validation
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Movie name query parameter is required",
      });
    }

    const movies = await MovieModel.find({
      name: {
        $regex: name.trim(),
        $options: "i", // case-insensitive
      },
      isActive: true,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
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
) => {
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
// export const confirmBooking = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const bookingId = req.params.bookingId;

//     if (!bookingId) {
//       throw createError(400, "Invalid Booking ID");
//     }

//     const booking = await BookingModel.findById(bookingId)
//       .populate("user", "fullname email")
//       .populate("movie", "name genre time rating");

//     if (!booking) {
//       throw createError(404, "Booking not found");
//     }

//     if (booking.confirmed) {
//       throw createError(400, "Booking already confirmed");
//     }

//     // Confirm booking
//     booking.confirmed = true;
//     await booking.save();

//     // Send mail if user and movie populated
//     const user = booking.user as any;
//     const movie = booking.movie as any;

//     const timeString = movie?.time || "N/A";

//     await sendMail({
//       to: user.email,
//       subject: "🎟️ Your Ticket is Confirmed!",
//       html: `
//         <h3>Hi ${user?.fullname || "User"},</h3>
//         <p>Your ticket for <strong>${movie?.name || "Movie"
//         }</strong> is confirmed!</p>
//         <p>🪑 Seats: ${booking?.seatNumbers?.join(", ")}</p>
//         <p>📍 Date: ${new Date(booking?.bookingTime).toDateString()}</p>
//         <p>⏰ Time: ${timeString}</p>
//         <br/>
//         <p>Enjoy your show! 🍿</p>
//       `,
//     });

//     res.status(200).json({
//       success: true,
//       message: "Booking confirmed successfully",
//       data: booking,
//     });
//   } catch (error: any) {
//     res.status(error.statusCode || 500).json({
//       success: false,
//       message:
//         error.message || "Something went wrong while confirming the booking",
//     });
//   }
// };

// Giving Rating and Review to the movie
// export const giveRatingAndReview = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const bookingId = req.params.bookingId;
//     const { rating, review } = req.body;

//     // Input validation
//     if (!bookingId || typeof rating !== "number" || !review) {
//       throw createError(400, "Booking ID, rating and review are required");
//     }

//     // Check rating range
//     if (rating < 1 || rating > 5) {
//       throw createError(400, "Booking ID, rating and review are required");
//     }

//     // Find booking
//     const booking = await BookingModel.findById(bookingId);

//     if (!booking) {
//       throw createError(404, "Booking not found");
//     }

//     if (!booking.confirmed) {
//       throw createError(400, "Only confirmed bookings can be reviewed");
//     }

//     // check if already rated or reviewed
//     if (booking.rating || booking.review) {
//       throw createError(400, "You have already rated or reviewed this booking");
//     }

//     // Add rating and review
//     booking.rating = rating;
//     booking.review = review;
//     await booking.save();

//     res.status(200).json({
//       success: true,
//       message: "Thank you for your feedback!",
//       data: {
//         movie: booking.movie,
//         rating: booking.rating,
//         review: booking.review,
//       },
//     });
//   } catch (error: any) {
//     res.status(error.statusCode || 500).json({
//       success: false,
//       message:
//         error.message ||
//         "Something went wrong while submitting your rating and review",
//     });
//   }
// };
