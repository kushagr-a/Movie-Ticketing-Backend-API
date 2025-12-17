import { Schema, model, Document, Types } from "mongoose";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface IBooking extends Document {
  user: Types.ObjectId;
  show: Types.ObjectId;
  seatNumbers: string[];
  status: BookingStatus;
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
    show: {
      type: Schema.Types.ObjectId,
      ref: "Show",
      required: true
    },
    seatNumbers: {
      type: [String],
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "CANCELLED"],
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
