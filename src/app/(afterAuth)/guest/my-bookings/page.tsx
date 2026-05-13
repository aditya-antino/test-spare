import type { Metadata } from "next";
import MyBookingsClient from "./myBookings-client";

export const metadata: Metadata = {
  title: "My Bookings | SpareSpace",
  description:
    "View and manage your bookings on SpareSpace. Track upcoming reservations and review past bookings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyBookingsPage() {
  return <MyBookingsClient />;
}