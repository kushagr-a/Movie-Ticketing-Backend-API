import { Request, Response } from "express";
import { MovieModel } from "../booking/movie.model";
import mongoose from "mongoose";

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
