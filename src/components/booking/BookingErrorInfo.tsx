import React from "react";

export default function BookingErrorInfo({
  bookingError,
}: {
  bookingError: string;
}) {
  return (
    <section className="border-t-2 py-2 text-flesh-500">
      <h3 className="font-bold">Error</h3>
      <p>{bookingError}</p>
    </section>
  );
}
