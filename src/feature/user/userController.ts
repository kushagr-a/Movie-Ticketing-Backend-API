import { Request, Response } from "express";
import crypto from "crypto";
import { MovieModel } from "../booking/movie/movieModel";
import mongoose from "mongoose";
import { BookingModel } from "../booking/movieBooking/bookingModel";
import { sendBookingConfirmation } from "../../utils/mail/sendMail";
import { UserModel } from "../auth/users.model";
import { SEAT_PRICE_MAP } from "../../utils/constant/constants";
import { allocateSeats } from "../../utils/services/seatHelperFun";
import { Types } from "mongoose";
import { IMovie } from "../booking/movie/movieModel";
import { IUser } from "../auth/users.model";
import { moderateFeedBack } from "../../utils/ai/feedBackModeration";
import { analyzeSentiment } from "../../utils/ai/sentimentAnalysis"
import { redisClient } from "../../utils/redis/redis";
import { geminiModerateFeedback } from "../../utils/ai/geminiModeration";
import { localModeration } from "../../utils/ai/localModeration";

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

    //  basic validation
    if (!movieId || !seatCategory || !persons) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (!Number.isInteger(persons) || persons <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid number of persons",
      });
    }

    //  movie check
    const movie = await MovieModel.findById(movieId as string);
    if (!movie || !movie.isActive) {
      return res.status(404).json({
        success: false,
        message: "Movie not available",
      });
    }

    //  block duplicate booking (same user + same movie)
    const existingBooking = await BookingModel.findOne({
      user: userId,
      movie: movieId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this movie",
      });
    }

    //  seat price
    const seatPrice =
      SEAT_PRICE_MAP[seatCategory as keyof typeof SEAT_PRICE_MAP];

    if (!seatPrice) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat category",
      });
    }

    const totalAmount = seatPrice * persons;

    //  allocate seats
    const seatNumbers = await allocateSeats(
      movieId as string,
      seatCategory,
      persons
    );

    //  create booking
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

    //  populate response
    const populatedBooking = await BookingModel.findById(booking._id)
      .populate("user", "fullName email")
      .populate("movie", "name genre durationMinutes");

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error: any) {
    //  duplicate index safety (optional but recommended)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You already have an active booking for this movie",
      });
    }

    console.log("Error creating booking", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Type guard to check if user is populated
const isPopulatedUser = (user: Types.ObjectId | IUser): user is IUser => {
  return user && typeof user === "object" && "email" in user;
};

// Type guard to check if movie is populated
const isPopulatedMovie = (movie: Types.ObjectId | IMovie): movie is IMovie => {
  return movie && typeof movie === "object" && "name" in movie;
};

export const confirmBooking = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.query;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID"
      });
    }

    const booking = await BookingModel.findById(bookingId)
      .populate("user", "fullName email")
      .populate("movie", "name genre durationMinutes");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (booking.paymentStatus === "PAID") {
      return res.status(200).json({
        success: true,
        message: "Booking already confirmed",
        booking,
      });
    }

    booking.paymentStatus = "PAID";
    booking.status = "CONFIRMED";
    await booking.save();

    // Type guard checks
    if (!isPopulatedUser(booking.user)) {
      return res.status(500).json({
        success: false,
        message: "User not populated",
      });
    }

    if (!isPopulatedMovie(booking.movie)) {
      return res.status(500).json({
        success: false,
        message: "Movie not populated",
      });
    }

    const user = booking.user;
    const movie = booking.movie;

    await sendBookingConfirmation(
      user.email,
      {
        userName: user.fullName,
        movieName: movie.name,
        showTime: "7:30 PM",
        showDate: "18 Dec 2025",
        seats: booking.seatNumbers,
        totalAmount: booking.totalAmount,
        bookingId: booking._id.toString(),
        theatreName: "PVR Cinemas",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking confirmed & ticket sent",
      booking,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// user booking history
export const userBookingHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const bookings = await BookingModel.find({ user: userId })
      .populate("user", "fullName email")
      .populate("movie", "name genre durationMinutes");

    return res.status(200).json({
      success: true,
      message: "Booking history fetched successfully",
      bookings,
    });
  } catch (error: any) {
    console.log("Error fetching booking history", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const userFeedBack = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const movieId = req.query.movieId as string;
    const { rating, review } = req.body;

    //  basic validation
    if (!userId || !movieId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    //  check confirmed booking
    const booking = await BookingModel.findOne({
      user: userId,
      movie: movieId,
      status: "CONFIRMED",
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: "You can give feedback only after watching the movie",
      });
    }

    //  prevent duplicate feedback
    if (booking.review) {
      return res.status(409).json({
        success: false,
        message: "Feedback already submitted",
      });
    }

    // LOCAL moderation (FIRST & MUST)
    const localCheck = localModeration(review);

    if (!localCheck.allowed) {
      return res.status(400).json({
        success: false,
        message: "Your feedback violates content policy",
        categories: localCheck.categories,
      });
    }

    // Redis key
    const reviewHash = crypto
      .createHash("sha256")
      .update(review)
      .digest("hex");

    const redisKey = `feedback:${userId}:${movieId}:${reviewHash}`;

    let categories: string[] = [];
    let sentiment: "positive" | "neutral" | "negative" = "neutral";

    const cached = await redisClient.get(redisKey);

    if (cached) {
      const parsed = JSON.parse(cached);
      categories = parsed.categories;
      sentiment = parsed.sentiment;
    } else {
      //  GEMINI moderation (SMART but optional)
      try {
        const geminiResult = await geminiModerateFeedback(review);

        if (!geminiResult.allowed) {
          return res.status(400).json({
            success: false,
            message: "Your feedback violates content policy",
            categories: geminiResult.categories,
          });
        }

        categories = geminiResult.categories;
      } catch (err) {
        console.warn("⚠️ Gemini unavailable, local moderation used");
      }

      // sentiment (optional)
      try {
        sentiment = await analyzeSentiment(review);
      } catch {
        sentiment = "neutral";
      }

      await redisClient.set(
        redisKey,
        JSON.stringify({ categories, sentiment }),
        { EX: 60 * 60 * 24 }
      );
    }

    //  save feedback
    booking.rating = rating;
    booking.review = review;
    booking.aiModeration = {
      allowed: true,
      categories,
      sentiment,
      confidence: 0.7,
    };

    await booking.save()

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      sentiment,
    });
  } catch (error) {
    console.error("Error submitting feedback", error);
    return res.status(500).json({
      success: false,
      message: "Feedback processing failed",
    });
  }
};
