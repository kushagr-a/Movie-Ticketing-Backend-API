// import { Schema, model, Document } from "mongoose";

// export interface IMovie extends Document {
//   name: string;
//   genre: "horror" | "comedy" | "action" | "drama" | "sci-fi";
//   industry: "bollywood" | "tollywood" | "hollywood";
//   rating: number;
//   time: string; // e.g., "6:30 PM"
// }

// const movieSchema = new Schema<IMovie>(
//   {
//     name: { type: String, required: true },
//     genre: {
//       type: String,
//       enum: ["horror", "comedy", "action", "drama", "sci-fi"],
//       required: true,
//     },
//     industry: {
//       type: String,
//       enum: ["bollywood", "tollywood", "hollywood"],
//       required: true,
//     },
//     rating: { type: Number, min: 0, max: 10, required: true },
//     time: { type: String, required: true },
//   },

//   { timestamps: true }
// );

// export const MovieModel = model<IMovie>("Movie", movieSchema);

import mongoose, { Schema, Document, Model } from "mongoose";


export enum MovieGenre {
  HORROR = "horror",
  COMEDY = "comedy",
  ACTION = "action",
  DRAMA = "drama",
  SCIFI = "sci-fi",
  ROMANTIC = "romantic",
  THRILLER = "thriller",
}

export enum MovieIndustry {
  BOLLYWOOD = "bollywood",
  TOLLYWOOD = "tollywood",
  HOLLYWOOD = "hollywood",
}

export interface IMovie extends Document {
  name: string;
  genre: MovieGenre;
  industry: MovieIndustry;
  rating: number;
  durationMinutes: number;
  releaseDate?: Date;

  poster: {
    publicId: string;
    url: string;
  };

  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}


const movieSchema = new Schema<IMovie>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
      index: true,
    },

    genre: {
      type: String,
      enum: Object.values(MovieGenre),
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    industry: {
      type: String,
      enum: Object.values(MovieIndustry),
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },


    rating: {
      type: Number,
      min: 0,
      max: 10,
      required: true,
      set: (v: number) => Math.round(v * 10) / 10,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      max: 600,
      required: true,
    },

    releaseDate: {
      type: Date,
    },

    poster: {
      publicId: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


movieSchema.index({ industry: 1, genre: 1, rating: -1 });

movieSchema.virtual("createdByRole", {
  ref: "User",
  localField: "createdBy",
  foreignField: "_id",
  justOne: true,
  options: { select: "role -_id" },
});

movieSchema.set("toJSON", { virtuals: false });
movieSchema.set("toObject", { virtuals: false });


export const MovieModel: Model<IMovie> =
  mongoose.models.Movie || mongoose.model<IMovie>("Movie", movieSchema);
