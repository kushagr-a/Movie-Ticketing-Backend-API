import { Schema, model, Document, Types } from "mongoose";

export interface IBooking extends Document {
  user: Types.ObjectId;
  movie: Types.ObjectId;
  seatNumbers: string[]; // e.g., ["A1", "A2"]
  confirmed: boolean;
  bookingTime: Date;
  rating?: number;
  review?: string;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    seatNumbers: { type: [String], required: true },
    confirmed: { type: Boolean, default: false },
    bookingTime: { type: Date, required: true },

    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true }
);

export const BookingModel = model<IBooking>("Booking", bookingSchema);
