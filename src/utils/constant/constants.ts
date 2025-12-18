import { SeatCategory } from "../../feature/booking/movieBooking/bookingModel";

export const SEAT_PRICE_MAP: Record<SeatCategory, number> = {
  PREMIUM: 500,
  GOLD: 300,
  SILVER: 150,
};

export const SEAT_RANGE_MAP: Record<
  SeatCategory,
  { prefix: string; start: number; end: number }
> = {
  PREMIUM: { prefix: "A", start: 1, end: 50 },
  GOLD: { prefix: "B", start: 51, end: 100 },
  SILVER: { prefix: "C", start: 101, end: 150 },
};
