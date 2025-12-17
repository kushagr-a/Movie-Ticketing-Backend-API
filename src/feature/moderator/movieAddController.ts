import { Request, Response } from "express";
import { MovieModel } from "../booking/movie.model";
import { AuthRequest } from "../auth/tokenVerify"
import mongoose from "mongoose";

export const addMovie = async (req: AuthRequest, res: Response) => {
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

        // const populatedMovie  = await movie.populate("createdBy");

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

        // const populatedMovie = await movie.populate({
        //     path: "createdBy",
        //     select: "role -_id",
        // });

        return res.status(201).json({
            success: true,
            message: "Movie added successfully",
            movie: {
                ...movie.toObject(),
                createdBy: req.user!.role,
            },
        });
    } catch (error) {
        console.error("ADD MOVIE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to add movie",
        });
    }
};
