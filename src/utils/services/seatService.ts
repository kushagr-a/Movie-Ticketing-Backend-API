import { SEAT_RANGE_MAP } from "../constant/constants";

export const allocateSeats = (
  seatCategory: "PREMIUM" | "GOLD" | "SILVER",
  persons: number
): string[] => {
  const range = SEAT_RANGE_MAP[seatCategory];

  if (!range) {
    throw new Error("Invalid seat category");
  }

  // 1 person → random seat
  if (persons === 1) {
    const random =
      Math.floor(Math.random() * (range.end - range.start + 1)) +
      range.start;

    return [`${range.prefix}${random}`];
  }

  // 2+ persons → consecutive seats
  const seats: string[] = [];
  const startSeat = range.start; // abhi simplest version

  for (let i = 0; i < persons; i++) {
    seats.push(`${range.prefix}${startSeat + i}`);
  }

  return seats;
};
