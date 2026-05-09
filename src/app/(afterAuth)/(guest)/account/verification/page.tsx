import type { Metadata } from "next";
import VerificationClient from "./verification-client";

export const metadata: Metadata = {
    title: "Identity Verification | SpareSpace",
    description:
        "Verify your identity by uploading valid ID documents such as Aadhaar, Passport, or Driving License.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function Verification() {
    return <VerificationClient />;
}