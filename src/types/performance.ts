export type OccupiedSeat = {
  occupantId: string;
  occupiedAt: string;
  reservationId: string;
  seatId: string;
  status: "processing" | "pending" | "booked";
};

export interface PerformanceTime {
  occupiedSeats?: OccupiedSeat[];
  time: string;
  casting: string[];
}
