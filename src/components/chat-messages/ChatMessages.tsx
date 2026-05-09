'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import { Message, Conversation } from '@/types/chat';

type Props = {
    selectedChat: Conversation;
    messages: Record<number, Message[]>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    hasMore: boolean;
    loadNextPage: () => void;
    page: number;
};

export default function ChatMessages({
    selectedChat,
    messages,
    messagesEndRef,
    hasMore,
    loadNextPage,
    page,
}: Props) {
    const chatMessages = messages[selectedChat.id] || [];

    const viewportRef = useRef<HTMLDivElement | null>(null);

    const [loading, setLoading] = useState(false);
    const prevScrollHeightRef = useRef<number | null>(null);
    const lastScrollTopRef = useRef<number | null>(null);
    const skipFirstScrollRef = useRef(true);

    // scroll handler logic
    const handleNativeScroll = () => {
        const el = viewportRef.current;
        if (!el || !hasMore || loading) return;

        const scrollTop = el.scrollTop;
        const last = lastScrollTopRef.current;

        const userScrollingUp = last !== null ? scrollTop < last : false;
        lastScrollTopRef.current = scrollTop;

        if (skipFirstScrollRef.current) {
            skipFirstScrollRef.current = false;
            return;
        }

        const threshold = 50;
        if (userScrollingUp && scrollTop <= threshold) {
            setLoading(true);
            prevScrollHeightRef.current = el.scrollHeight;
            loadNextPage();
        }
    };

    // attach native scroll listener
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleNativeScroll, { passive: true });
        return () => el.removeEventListener('scroll', handleNativeScroll);
    }, [selectedChat.id, hasMore, loadNextPage, loading]);

    // restore scroll after prepend
    useEffect(() => {
        if (page === 1) return;
        const el = viewportRef.current;
        if (!el) return;

        if (loading && prevScrollHeightRef.current != null) {
            const newHeight = el.scrollHeight;
            const previous = prevScrollHeightRef.current;
            el.scrollTop = newHeight - previous;

            prevScrollHeightRef.current = null;
            setLoading(false);
        }
    }, [messages[selectedChat.id]]);

    // reset refs when switching chats
    useEffect(() => {
        skipFirstScrollRef.current = true;
        lastScrollTopRef.current = null;
        prevScrollHeightRef.current = null;
        setLoading(false);
    }, [selectedChat.id]);

    // scroll to bottom when switching to a chat
    useEffect(() => {
        const chatMsgs = messages[selectedChat.id] || [];
        if (!chatMsgs.length) return;

        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, [selectedChat.id]);

    return chatMessages.length > 0 ? (
        <ScrollArea className="flex-1 w-full h-full border-gray-200" viewportRef={viewportRef}>
            <div className="flex flex-col space-y-2 p-4">
                {/* 🔥 Loader at the top when fetching more */}
                {loading && (
                    <div className="flex justify-center py-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F6CD28]"></div>
                    </div>
                )}

                {chatMessages.map((msg, index) => (
                    <MessageBubble key={`${msg.id}-${index}`} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
            </div>
        </ScrollArea>
    ) : (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-sm px-4">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-gray-400 font-medium text-xl">No Messages available!</h3>
            </div>
        </div>
    );
}
