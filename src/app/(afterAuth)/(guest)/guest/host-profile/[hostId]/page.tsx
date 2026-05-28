import type { Metadata } from "next";
import HostProfileClient from "./hostProfile-client";

export const metadata: Metadata = {
    title: "Host Profile | SpareSpace",
    description:
        "View host profile, listed spaces, and guest reviews on SpareSpace.",
    robots: {
        index: true,
        follow: true,
    },
};

export default function HostProfilePage() {
    return <HostProfileClient />;
}