import { BookingModel } from "../../feature/booking/movieBooking/bookingModel";
import { SeatCategory } from "../../feature/booking/movieBooking/bookingModel";
import { SEAT_RANGE_MAP } from "../constant/constants";

/**
 * Get all booked seats for a movie + category
 */
const getBookedSeats = async (
  movieId: string,
  seatCategory: SeatCategory
): Promise<string[]> => {
  const bookings = await BookingModel.find({
    movie: movieId,
    seatCategory,
    status: { $ne: "CANCELLED" },
  }).select("seatNumbers");

  return bookings.flatMap((b) => b.seatNumbers);
};

const generateAllSeats = (
  seatCategory: SeatCategory
): string[] => {
  const range = SEAT_RANGE_MAP[seatCategory];
  const seats: string[] = [];

  for (let i = range.start; i <= range.end; i++) {
    seats.push(`${range.prefix}${i}`);
  }

  return seats;
};

const findConsecutiveSeats = (
  seats: string[],
  persons: number
): string[] | null => {
  const seatNums = seats
    .map((s) => Number(s.slice(1)))
    .sort((a, b) => a - b);

  for (let i = 0; i <= seatNums.length - persons; i++) {
    const chunk = seatNums.slice(i, i + persons);

    const isConsecutive = chunk.every(
      (num, idx) => idx === 0 || num === chunk[idx - 1] + 1
    );

    if (isConsecutive) {
      return chunk.map((n) => `${seats[0][0]}${n}`);
    }
  }

  return null;
};

export const allocateSeats = async (
  movieId: string,
  seatCategory: SeatCategory,
  persons: number
): Promise<string[]> => {
  const bookedSeats = await getBookedSeats(movieId, seatCategory);

  const allSeats = generateAllSeats(seatCategory);

  const availableSeats = allSeats.filter(
    (seat) => !bookedSeats.includes(seat)
  );

  if (availableSeats.length < persons) {
    throw new Error("Seats not available");
  }

  // 1 person → random
  if (persons === 1) {
    const randomSeat =
      availableSeats[Math.floor(Math.random() * availableSeats.length)];

    return [randomSeat];
  }

  // 2+ persons → consecutive
  const consecutiveSeats = findConsecutiveSeats(
    availableSeats,
    persons
  );

  if (!consecutiveSeats) {
    throw new Error("Consecutive seats not available");
  }

  return consecutiveSeats;
};
