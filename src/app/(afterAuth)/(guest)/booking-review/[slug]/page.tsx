import type { Metadata } from "next";
import BookingReviewClient from "./bookingReview-client";
import PersistGateWrapper from "@/components/common/PersistGateWrapper";

export const metadata: Metadata = {
  title: "Review Your Booking | SpareSpace",
  description:
    "Review your booking details before confirming your reservation on SpareSpace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BookingReviewPage() {
  return (
    <PersistGateWrapper>
      <BookingReviewClient />
    </PersistGateWrapper>
  );
}