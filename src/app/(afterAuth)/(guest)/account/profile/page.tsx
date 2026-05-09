import type { Metadata } from "next";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
  title: "My Profile | SpareSpace",
  description: "Manage your SpareSpace profile, update personal details, and customize your account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Profile() {
  return <ProfileClient />;
}

