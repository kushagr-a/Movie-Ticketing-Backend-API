import { Schema, model, Document } from "mongoose";

export interface IMovie extends Document {
  name: string;
  genre: "horror" | "comedy" | "action" | "drama" | "sci-fi";
  industry: "bollywood" | "tollywood" | "hollywood";
  rating: number;
  time: string; // e.g., "6:30 PM"
}

const movieSchema = new Schema<IMovie>(
  {
    name: { type: String, required: true },
    genre: {
      type: String,
      enum: ["horror", "comedy", "action", "drama", "sci-fi"],
      required: true,
    },
    industry: {
      type: String,
      enum: ["bollywood", "tollywood", "hollywood"],
      required: true,
    },
    rating: { type: Number, min: 0, max: 10, required: true },
    time: { type: String, required: true },
  },
  
  { timestamps: true }
);

export const MovieModel = model<IMovie>("Movie", movieSchema);
