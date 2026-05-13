import type { Metadata } from "next";
import ChatMessagesClient from "./chatMessages-client";

export const metadata: Metadata = {
  title: "Messages | SpareSpace",
  description: "Chat with hosts and guests regarding your bookings on SpareSpace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ChatMessagesPage() {
  return <ChatMessagesClient />;
}