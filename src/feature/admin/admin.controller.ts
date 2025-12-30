import { Request, Response } from "express";
import { UserModel } from "../auth/users.model"
import { MovieModel } from "../booking/movie/movieModel"
import cloudinary from "../../utils/cloudinary/cloudinary"
import mongoose from "mongoose"
import { BookingModel } from "../booking/movieBooking/bookingModel";

// add movie by admin
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

// getting all user profile
export const gettingAllUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const allUsers = await UserModel.find();
        res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            data: allUsers,
        });
    } catch (error: any) {
        console.error("Error in getAllUserProfile:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// get all movies
export const getAllMovies = async (req: Request, res: Response) => {
    try {
        const movies = await MovieModel.find();
        res.status(200).json({
            success: true,
            message: "All movies fetched successfully",
            data: movies,
        });
    } catch (error: any) {
        console.error("Error in getAllMovies:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

// admin get movie those only added by admin
export const getMovieByAdmin = async (req: Request, res: Response) => {
    try {
        const movies = await MovieModel.find({
            createdBy: new mongoose.Types.ObjectId(req.user!.id),
        })
            .populate("createdBy", "role")
            .select("-__v");

        // transform response
        const formattedMovies = movies.map((movie) => {
            const m = movie.toObject();

            return {
                ...m,
                createdBy: (m.createdBy as any)?.role || null,
            };
        });

        return res.status(200).json({
            success: true,
            message: "All movies fetched successfully",
            data: formattedMovies,
        });
    } catch (error: any) {
        console.error("Error in getMovieByAdmin:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// update movie by admin
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
            req.user!.role !== "admin"
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

// delete movie by admin
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
            req.user!.role !== "admin"
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

export const getparticularUserFeedBack = async (
    req: Request,
    res: Response
) => {
    try {
        const { userId } = req.query;

        // Validate user id
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

        //  AGGREGATION PIPELINE
        const feedbacks = await BookingModel.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId as string),
                    status: "CONFIRMED",
                    $or: [
                        { rating: { $ne: null } },
                        { review: { $ne: null } },
                    ],
                },
            },
            {
                $lookup: {
                    from: "movies",
                    localField: "movie",
                    foreignField: "_id",
                    as: "movieData",
                },
            },
            { $unwind: "$movieData" },
            {
                $project: {
                    _id: 0,
                    movieName: "$movieData.name",
                    rating: 1,
                    review: 1,
                },
            },
        ]);
        return res.status(200).json({
            success: true,
            message: "User feedback fetched successfully",
            user,
            totalFeedbacks: feedbacks.length,
            feedbacks,
        });
    } catch (error: any) {
        console.error("AGGREGATION USER FEEDBACK ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deleteUserBythereUserId = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        // Validate user id
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

        //  Delete user
        await user.deleteOne();

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
