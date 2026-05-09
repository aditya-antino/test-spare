import type { Metadata } from "next";
import GuestProfileClient from "./guestProfile-client";

export const metadata: Metadata = {
    title: "Guest Profile | SpareSpace",
    description: "View guest profile, reviews, and activity history on SpareSpace.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function GuestProfilePage() {
    return <GuestProfileClient />;
}