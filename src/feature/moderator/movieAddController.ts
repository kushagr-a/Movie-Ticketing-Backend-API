import { Request, Response } from "express";
import { MovieModel } from "../booking/movie/movieModel";
import mongoose from "mongoose";
import cloudinary from "../../utils/cloudinary/cloudinary";
import { UserModel } from "../auth/users.model";
import { BookingModel } from "../booking/movieBooking/bookingModel";

export const addMovie = async (req: Request, res: Response) => {
    try {
        const {
            name,
            genre,
            industry,
            rating,
            durationMinutes,
            releaseDate,
        } = req.body;

        if (
            !name ||
            !genre ||
            !industry ||
            rating === undefined ||
            !durationMinutes
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided",
            });
        }

        // poster check
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Movie poster is required",
            });
        }


        // Duplicate movie check
        const existingMovie = await MovieModel.findOne(
            {
                name: name.trim(),
                industry: industry.toLowerCase(),
                isActive: true,
            }
        )

        if (existingMovie) {
            return res.status(400).json(
                {
                    success: false,
                    message: "Movie already exists. You can update it insteed",
                    movie: {
                        ...existingMovie.toObject(),
                        createdBy: req.user!.role,
                    },
                }
            )
        }

        const movie = await MovieModel.create({
            name,
            genre,
            industry,
            rating,
            durationMinutes,
            releaseDate,
            poster: {
                publicId: req.file.filename, // cloudinary
                url: req.file.path,
            },
            createdBy: new mongoose.Types.ObjectId(req.user!.id),
        });



        return res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie: {
                ...movie.toObject(),
                createdBy: req.user!.role,
            },
        });
    } catch (error: any) {

        // Unique index error fallback
        if (error.code === 11000) {
            return res.status(409).json(
                {
                    success: false,
                    message: "Movie already exists."

                }
            )
        }

        console.error("ADD MOVIE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add movie",
        });
    }
};

export const getAllMoviesByModerator = async (req: Request, res: Response) => {
    try {
        const movies = await MovieModel.find({ isActive: true })
            .populate("createdBy", "role")
            .select("-__v");

        const formattedMovies = movies.map((movie) => {
            const m = movie.toObject();

            return {
                ...m,
                createdBy: (m.createdBy as any)?.role || null,
            };
        });

        return res.status(200).json({
            success: true,
            message: "Movies fetched successfully",
            totalMovies: formattedMovies.length,
            movies: formattedMovies,
        });
    } catch (error: any) {
        console.error("Error in getAllMoviesByModerator:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllMoviesAddedByModerator = async (
    req: Request,
    res: Response
) => {
    try {
        const movies = await MovieModel.find({ isActive: true })
            .populate("createdBy", "role")
            .select("-__v");

        // only moderator movies
        const moderatorMovies = movies
            .filter(
                (movie) => (movie.createdBy as any)?.role === "moderator"
            )
            .map((movie) => {
                const m = movie.toObject();
                return {
                    ...m,
                    createdBy: "moderator",
                };
            });

        return res.status(200).json({
            success: true,
            message: "Movies added by moderator fetched successfully",
            totalMovies: moderatorMovies.length,
            movies: moderatorMovies,
        });
    } catch (error: any) {
        console.error("Error in getAllMoviesAddedByModerator:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateMovieById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        //  Validate movie ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID",
            });
        }

        //  Fetch existing movie
        const movie = await MovieModel.findById(id);
        if (!movie || !movie.isActive) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        //  Ownership / role check
        if (
            movie.createdBy.toString() !== req.user!.id &&
            req.user!.role !== "moderator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this movie",
            });
        }

        // Allow only safe fields
        const allowedFields = [
            "name",
            "genre",
            "industry",
            "rating",
            "durationMinutes",
            "releaseDate",
        ];

        const updateData: any = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        }

        // Type & value validation
        if (updateData.rating && (updateData.rating < 1 || updateData.rating > 10)) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 10",
            });
        }

        if (updateData.releaseDate) {
            const parsedDate = new Date(updateData.releaseDate);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid release date format",
                });
            }
            updateData.releaseDate = parsedDate;
        }

        //  Poster replace (optional)
        if (req.file) {
            // delete old poster
            if (movie.poster?.publicId) {
                await cloudinary.uploader.destroy(movie.poster.publicId);
            }

            updateData.poster = {
                publicId: req.file.filename,
                url: req.file.path,
            };
        }

        //  Update movie
        const updatedMovie = await MovieModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        const movieObj = updatedMovie!.toObject();

        return res.status(200).json({
            success: true,
            message: "Movie updated successfully",
            data: {
                ...movieObj,
                updatedBy: req.user!.role,
                createdBy: undefined,
            },
        });

    } catch (error: any) {
        console.error("UPDATE MOVIE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteMovieById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Validate movie ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie ID",
            });
        }

        // Fetch existing movie
        const movie = await MovieModel.findById(id);
        if (!movie || !movie.isActive) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        // Ownership / role check
        if (
            movie.createdBy.toString() !== req.user!.id &&
            req.user!.role !== "moderator"
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this movie",
            });
        }

        // Delete movie
        await movie.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Movie deleted successfully",
        });
    } catch (error: any) {
        console.error("DELETE MOVIE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllUser = async (req: Request, res: Response) => {
    try {
        const users = await UserModel.find({ role: "user" }).select("-password");
        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            users,
        });
    } catch (error: any) {
        console.error("GET ALL USERS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getAllModerator = async (req: Request, res: Response) => {
    try {
        const moderators = await UserModel.find({ role: "moderator" }).select("-password");
        return res.status(200).json({
            success: true,
            message: "Moderators fetched successfully",
            moderators,
        });
    } catch (error: any) {
        console.error("GET ALL MODERATORS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getParticularUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id).select("-password");
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user,
        });
    } catch (error: any) {
        console.error("GET PARTICULAR USER ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const getparticularUserFeedBack = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = req.query;

        //  Validate user id
        if (!mongoose.Types.ObjectId.isValid(userId as string)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id",
            });
        }

        //  Fetch user
        const user = await UserModel.findById(userId).select("-password -__v");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        //  Fetch feedback (only where review or rating exists)
        const feedbackDocs = await BookingModel.find({
            user: userId,
            status: "CONFIRMED",
            $or: [
                { rating: { $exists: true } },
                { review: { $exists: true } },
            ],
        })
            .select("rating review");
        const feedbacks = feedbackDocs.map((fb) => ({
            rating: fb.rating ?? null,
            review: fb.review ?? null,
        }));

        //  Response
        return res.status(200).json({
            success: true,
            message: "User feedback fetched successfully",
            user,
            totalFeedbacks: feedbacks.length,
            feedbacks,
        });
    } catch (error: any) {
        console.error("GET PARTICULAR USER FEEDBACK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};