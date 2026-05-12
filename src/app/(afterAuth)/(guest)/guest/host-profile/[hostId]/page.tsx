import type { Metadata } from "next";
import HostProfileClient from "./hostProfile-client";

export const metadata: Metadata = {
    title: "Host Profile | SpareSpace",
    description:
        "View host profile, listed spaces, and guest reviews on SpareSpace.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function HostProfilePage() {
    return <HostProfileClient />;
}