import type { Metadata } from "next";
import WishlistsClient from "./wishlists-client";

export const metadata: Metadata = {
    title: "My Wishlist | SpareSpace",
    description:
        "View and manage your saved spaces on SpareSpace. Quickly access the venues you’ve added to your wishlist.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function WishlistsPage() {
    return <WishlistsClient />;
}