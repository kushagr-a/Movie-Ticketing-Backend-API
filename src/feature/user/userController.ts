import { Request, Response } from "express";
// import { createError } from "../../utils/createError.utils";
import { MovieModel } from "../booking/movie/movieModel";
import mongoose from "mongoose";
import { BookingModel } from "../booking/movieBooking/bookingModel";
import { sendMail } from "../../utils/mail/sendMail";
import { UserModel } from "../auth/users.model";
import { SEAT_PRICE_MAP } from "../../utils/constant/constants";
import { allocateSeats } from "../../utils/services/seatHelperFun";

// Getting User profile
export const userProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      success: true,
      user,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
}

// Get all movies those upload by admin for users
export const getAllMovies = async (req: Request, res: Response) => {
  try {
    const filter = { isActive: true };

    const [movies, total] = await Promise.all([
      MovieModel.find(filter)
        .select("-__v")
        .sort({ createdAt: -1 }),
      MovieModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      totalMovies: total,
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

export const bookMovie = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { seatCategory, persons } = req.body;
    const { movieId } = req.query;

    if (!movieId || !seatCategory || !persons) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    const movie = await MovieModel.findById(movieId as string);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: "Movie not available",
      });
    }

    const seatPrice = SEAT_PRICE_MAP[seatCategory as keyof typeof SEAT_PRICE_MAP];
    if (!seatPrice) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat category",
      });
    }

    const totalAmount = seatPrice * persons;

    const seatNumbers = await allocateSeats(
      movieId as string,
      seatCategory,
      persons
    );

    const booking = await BookingModel.create({
      user: userId,
      movie: movieId,
      seatCategory,
      seatNumbers,
      persons,
      totalAmount,
      status: "PENDING",
      paymentStatus: "PENDING",
    });

    const populatedBooking = await BookingModel.findById(booking._id)
      .populate("user", "fullName email")
      .populate("movie", "name genre durationMinutes");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error: any) {
    console.log("Error creating booking", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const confirmPayment = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    const booking = await BookingModel.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // already handled case
    if (booking.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Payment already confirmed",
        booking,
      });
    }

    booking.paymentStatus = "PAID";
    booking.status = "CONFIRMED";

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Payment successful, booking confirmed",
      booking,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
