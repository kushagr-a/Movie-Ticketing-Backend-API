// import { Request, Response, NextFunction } from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import { UserModel } from "../auth/users.model"
// import { createError } from "../../utils/createError.utils"
// import { MovieModel } from "../booking/movie.model";
// import { BookingModel } from "../booking/booking.model";

// // Controller for Register Admin
// export const registerAdmin = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       throw createError(400, "All fields are required");
//     }

//     // User exist or  not
//     const existingUser = await UserModel.findOne({ email });
//     if (existingUser) {
//       throw createError(409, "Admin exists with this email");
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12);

//     // Create new admin user
//     const newAdmin = await UserModel.create({
//       name,
//       email,
//       password: hashedPassword,
//       role: "admin", // Admin role
//     });

//     // Save admin
//     await newAdmin.save();

//     // Convert to plain object and remove password
//     const admin = newAdmin.toObject() as any;
//     delete admin.password;

//     // Genrate JWT token
//     const token = jwt.sign(
//       { id: newAdmin._id, role: newAdmin.role },
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

//     // Respose to the client
//     res.status(200).json({
//       message: "Admin registered successfully",
//       admin,
//       token,
//     });
//   } catch (error: any) {
//     res
//       .status(error.statusCode || 500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// };

// // Controller for Login Admin
// export const loginAdmin = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       throw createError(400, "All fields are required");
//     }

//     // Find admin user
//     const admin = await UserModel.findOne({ email });
//     if (!admin || admin.role !== "admin") {
//       throw createError(401, "Invalid credentials or not an admin");
//     }

//     // compare the password
//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       throw createError(401, "Invalid credentials or not an admin");
//     }

//     // Genrate JWT token
//     const token = jwt.sign(
//       { id: admin._id, role: admin.role },
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
//     const adminData = admin.toObject() as any;
//     delete adminData.password;

//     res.status(200).json({
//       message: "Login successful",
//       admin: adminData,
//       token,
//     });
//   } catch (error: any) {
//     res
//       .status(error.statusCode || 500)
//       .json({ message: error.message || "Internal Server Error" });
//   }
// };

// // Controller for Logout Admin
// export const logoutAdmin = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     });

//     res.status(200).json({ message: "Admin logged out successfully" });
//   } catch (error) {
//     res.status(500).json({
//       message: "Something went wrong during logout",
//     });
//   }
// };

// // Add movie controller
// export const addMovie = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { name, genre, industry, rating, time } = req.body;

//     // Basic validation
//     if (!name || !genre || !industry || rating == null || !time) {
//       throw createError(400, "All fields are required");
//     }
//     // console.log(req.body)

//     const movie = await MovieModel.create({
//       name,
//       genre,
//       industry,
//       rating,
//       time,
//     });

//     // console.log(req.body)

//     res.status(201).json({
//       success: true,
//       message: "Movie added successfully",
//       data: movie,
//     });
//   } catch (error) {
//     console.error("🔥 Error in addMovie:", error); // 👈 Add this
//     next(error); // Forward to error handler
//   }
// };

// // get all movies
// export const getAllMovies = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const movies = await MovieModel.find();

//     res.status(200).json({
//       success: true,
//       message: "All Movies added by admin",
//       data: movies,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch movies",
//     });
//   }
// };

// // Update movie controller
// export const updateMovie = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { id } = req.params;
//     const { name, genre, industry, rating, time } = req.body;

//     // validation movie ID
//     if (!id) {
//       throw createError(400, "Movie ID is required");
//     }

//     // Find and update the movie
//     const updatedMovie = await MovieModel.findByIdAndUpdate(
//       id,
//       { name, genre, industry, rating, time },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMovie) {
//       throw createError(404, "Movie not found");
//     }

//     res.status(200).json({
//       success: true,
//       message: "Movie updated successfully",
//       data: updatedMovie,
//     });
//   } catch (error) {
//     console.error(" Error in updateMovie:", error);
//     next(error);
//   }
// };

// // Get all booking by user
// export const getAllBookings = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const allBookings = await BookingModel.find()
//       .populate("user", "fullname email") //  show user's name & email
//       .populate("movie", "name") // show movie name
//       .select("user movie seatNumbers createdAt") // only selected fields
//       .sort({ createdAt: -1 }); // sort by createdAt in descending order

//     res.status(200).json({
//       success: true,
//       message: "All bookings fetched successfully",
//       data: allBookings,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Error fetching bookings",
//     });
//   }
// };

// // get all reviews
// export const getaAllReviews = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const reviews = await BookingModel.find({
//       rating: { $exists: true },
//       review: { $exists: true },
//     })
//       .populate("user", "fullname email") // show user's name 
//       .populate("movie", "name") // show movie name
//       .select("rating review user movie") // only selected fields

//     res.status(200).json({
//       success: true,
//       message: "All reviews fetched successfully",
//       data: reviews,
//     })
//   } catch (error: any) {
//     res.status(500).json({
//       success: false,
//       message: error.message || "Error fetching reviews",
//     });
//   }
// }
