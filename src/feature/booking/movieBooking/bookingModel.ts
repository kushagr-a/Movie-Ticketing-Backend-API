import { Schema, model, Document, Types } from "mongoose";
import { IUser } from "../../auth/users.model";
import { IMovie } from "../movie/movieModel"; // Add this import

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type SeatCategory = "PREMIUM" | "GOLD" | "SILVER";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface IBooking extends Document {
  user: Types.ObjectId | IUser;
  movie: Types.ObjectId | IMovie; // Updated to include IMovie
  seatCategory: SeatCategory;
  seatNumbers: string[];
  persons: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  bookingTime: Date;
  rating?: number;
  review?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
      required: true
    },

    seatCategory: {
      type: String,
      enum: ["PREMIUM", "GOLD", "SILVER"],
      required: true
    },

    seatNumbers: {
      type: [String],
      required: true
    },

    persons: {
      type: Number,
      required: true,
      min: 1
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
      default: "PENDING"
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING"
    },

    bookingTime: {
      type: Date,
      default: Date.now
    },

    rating: {
      type: Number,
      min: 1,
      max: 5
    },

    review: {
      type: String
    }
  },
  { timestamps: true }
);

export const BookingModel = model<IBooking>("Booking", bookingSchema);