import type { Metadata } from "next";
import { GstClient } from "./gst-client";

export const metadata: Metadata = {
    title: "GST Details | SpareSpace",
    description: "Add or manage your GST details for invoicing and tax compliance.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function GuestGST() {
    return <GstClient />;
}