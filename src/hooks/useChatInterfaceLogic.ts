import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useChatMessages, useLastBooking } from '@/hooks/chatMessage';
import { RootState } from '@/store/store';
import { Conversation, Message } from '@/types/chat';
import { BookingDetailsType } from '@/types/booking.types';
import { handleApiError } from '@/hooks/handleApiError';
import { toast } from 'react-toastify';
import { updateHeaderNotification } from '@/store/slice/headerNotificationSlice';
import { formatConversations, formatBookingDetails } from '@/utils/chatMappers';
import { useGuestMode } from '@/hooks';

const LIMIT = 10;

export function useChatInterfaceLogic() {
    const dispatch = useDispatch();
    const { isHostMode: isInHost } = useGuestMode();
    const queryClient = useQueryClient();
    const basePath = isInHost ? '/host' : '';
    // Note: basePath for guest is now empty as 'guest' prefix was removed.

    const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Record<number, Message[]>>({});
    const [conversationsState, setConversationsState] = useState<Conversation[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [active, setActive] = useState<'all' | 'unread'>('all');
    const [showSidebar, setShowSidebar] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [bookingId, setBookingId] = useState<string | number>('');
    const [bookingDetails, setBookingDetails] = useState<BookingDetailsType | null>(null);
    const [isAcceptOpen, setIsAcceptOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [conversationsLoading, setConversationsLoading] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const firstLoadRef = useRef(false);
    const hasMarkedAsReadRef = useRef<Set<number>>(new Set());

    const { id: senderId } = useSelector((state: RootState) => state.auth.user) || { id: '' };

    const {
        userId: selectChatUserID = 0,
        id: selectedChatID = 0,
        receiver: { id: receiverId = 0 } = {},
    } = selectedChat || {};

    // TanStack Query for messages
    const { data: userMessage } = useChatMessages(
        selectChatUserID,
        receiverId || 0,
        selectedChatID || 0,
        page,
        LIMIT,
    );

    // TanStack Query for booking details
    const {
        refetch: refetchLastBooking,
        isLoading: isLoadingBooking,
        data: lastBookingData
    } = useLastBooking(selectedChatID, {
        onSuccess: (data: any) => {
            if (!data?.data) return;
            const fetchedData = data.data;
            const convertedData = formatBookingDetails(fetchedData);
            setBookingDetails(convertedData as any);
            setSelectedRow({
                ...convertedData,
                end_datetime: fetchedData.endDatetime,
                start_datetime: fetchedData.startDatetime,
                User: fetchedData.User
                    ? {
                        ...fetchedData.User,
                        first_name: fetchedData.User?.firstName,
                        last_name: fetchedData.User?.lastName
                            ? fetchedData.User.lastName[0] + '.'
                            : '',
                        phone_number: fetchedData.User?.phoneNumber,
                        avatar: fetchedData.User?.avatar || '/image.png',
                    }
                    : null,
            });
        },
        onError: (err) => {
            handleApiError(err);
        },
    });

    // Update booking details when data changes
    useEffect(() => {
        if (lastBookingData?.data && selectedChatID) {
            const fetchedData = lastBookingData.data;
            const convertedData = formatBookingDetails(fetchedData);
            setBookingDetails(convertedData as any);
            setSelectedRow({
                ...convertedData,
                end_datetime: fetchedData.endDatetime,
                start_datetime: fetchedData.startDatetime,
                User: fetchedData.User
                    ? {
                        ...fetchedData.User,
                        first_name: fetchedData.User?.firstName,
                        last_name: fetchedData.User?.lastName
                            ? fetchedData.User.lastName[0] + '.'
                            : '',
                        phone_number: fetchedData.User?.phoneNumber,
                        avatar: fetchedData.User?.avatar || '/image.png',
                    }
                    : null,
            });
        }
    }, [lastBookingData, selectedChatID]);

    // Socket: Load conversations
    useEffect(() => {
        if (!senderId) return;

        const socket = getSocket();
        const emitEventName = isInHost ? 'get_host_booking_with_messages' : 'get_guest_booking_with_messages';
        const listenEventName = isInHost ? 'host_booking_with_messages' : 'guest_booking_with_messages';

        setConversationsLoading(true);
        socket.emit(emitEventName, {
            ...(isInHost ? { hostId: senderId } : { guestId: senderId }),
            is_read: undefined,
        });

        const handleBookingsResponse = (response: any) => {
            setConversationsLoading(false);
            const bookingsData = response?.data || response;
            if (!bookingsData || !Array.isArray(bookingsData)) return;

            dispatch(updateHeaderNotification({ chat: true }));
            const formattedConversations = formatConversations(bookingsData, isInHost);


            setConversationsState((prev) => {
                const existingTimestamps = new Map(prev.map(c => [c.id, c.lastMessageTime]));
                return formattedConversations.map(conv => ({
                    ...conv,
                    lastMessageTime: existingTimestamps.get(conv.id) || conv.lastMessageTime
                }));
            });
        };

        const handleError = () => setConversationsLoading(false);

        socket.on(listenEventName, handleBookingsResponse);
        socket.on('error', handleError);

        return () => {
            socket.off(listenEventName, handleBookingsResponse);
            socket.off('error', handleError);
        };
    }, [senderId, isInHost, dispatch]);

    // Sync bookingId
    useEffect(() => {
        setBookingId(selectedChatID);
    }, [selectedChatID]);

    // Re-fetch booking details when chat changes
    useEffect(() => {
        if (selectedChatID && selectedChat?.id === selectedChatID) {
            setBookingDetails(null);
            queryClient.invalidateQueries({ queryKey: ['lastBooking', selectedChatID], exact: true });
            refetchLastBooking({ cancelRefetch: false }).catch((e) => { handleApiError(e); });
        } else if (!selectedChatID || !selectedChat) {
            setBookingDetails(null);
        }
    }, [selectedChatID, selectedChat?.id, refetchLastBooking, queryClient]);

    // Process messages from query
    useEffect(() => {
        if (userMessage && selectedChat) {
            const reversedMessages = [...(userMessage?.messages || [])].reverse();
            const formattedMessages: Message[] = reversedMessages.map((msg: any) => ({
                id: msg.id,
                text: msg.content || msg.message,
                sender: msg.senderId,
                timestamp: new Date(msg.sent_at),
                isOwn: msg.senderId === senderId,
                status: msg.isRead ? 'read' : 'delivered',
            }));

            setMessages((prev) => {
                const existingMessages = prev[selectedChat.id] || [];
                if (page === 1) {
                    return { ...prev, [selectedChat.id]: formattedMessages };
                }
                const existingIds = new Set(existingMessages.map((m) => m.id));
                const newMessages = formattedMessages.filter((m) => !existingIds.has(m.id));
                return { ...prev, [selectedChat.id]: [...newMessages, ...existingMessages] };
            });
            setHasMore(userMessage?.messages?.length >= LIMIT);
        }
    }, [userMessage, selectedChat, senderId, page]);

    // Search debounce
    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    // Filter conversations
    const filteredConversations = useMemo(() => {
        let filtered = conversationsState;
        if (active === 'unread') {
            filtered = filtered.filter((conv) => Number(conv.unreadCount) > 0);
        }
        if (debouncedSearch) {
            const searchLower = debouncedSearch.toLowerCase();
            filtered = filtered.filter((conv) => {
                const userName = isInHost
                    ? `${conv.firstName || ''} ${conv.lastName || ''}`.toLowerCase()
                    : `${conv.receiver?.firstName || ''} ${conv.receiver?.lastName || ''}`.toLowerCase();
                const spaceName = conv.booking?.Space?.title?.toLowerCase() || '';
                const spaceType = conv.spaceType?.toLowerCase() || '';
                const lastMsg = conv.lastMessage?.toLowerCase() || '';
                return (
                    userName.includes(searchLower) ||
                    spaceName.includes(searchLower) ||
                    spaceType.includes(searchLower) ||
                    lastMsg.includes(searchLower)
                );
            });
        }
        return filtered.sort((a, b) => {
            const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
            const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
            return timeB - timeA;
        });
    }, [conversationsState, debouncedSearch, active, isInHost]);

    // Mark as read logic
    const markVisibleMessagesAsReadValue = useCallback(() => {
        if (!selectedChat) return;
        const socket = getSocket();
        if (!socket || !socket.connected) return;

        const convId = selectedChat.id;
        const currentMessages = messages[convId] || [];
        const unreadIncoming = currentMessages.filter((m) => !m.isOwn && m.status !== 'read');
        if (!unreadIncoming.length) return;

        const messagesToMark = unreadIncoming.filter((msg) => !hasMarkedAsReadRef.current.has(Number(msg.id)));
        if (!messagesToMark.length) return;

        const messageIds = messagesToMark.map((msg) => {
            hasMarkedAsReadRef.current.add(Number(msg.id));
            return msg.id;
        });

        try {
            messageIds.forEach((msgId) => {
                socket.emit('on_message_read', { messageId: msgId }, (response: any) => {
                    if (response?.success) {
                        setConversationsState((prev) =>
                            prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c)),
                        );
                    }
                });
            });
        } catch (error) {
            handleApiError(error);
        }
    }, [selectedChat, messages]);

    const markAsReadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (markAsReadTimeoutRef.current) clearTimeout(markAsReadTimeoutRef.current);
        markAsReadTimeoutRef.current = setTimeout(() => {
            markVisibleMessagesAsReadValue();
        }, 500);
        return () => {
            if (markAsReadTimeoutRef.current) clearTimeout(markAsReadTimeoutRef.current);
        };
    }, [selectedChatID, messages[selectedChatID || -1]?.length, markVisibleMessagesAsReadValue]);

    // Handle new messages
    const handleReceiveMessage = useCallback(
        (data: any) => {
            if (!data) return;
            const convId = data.bookingId || data.conversationId || selectedChatID;
            if (!convId) return;

            if (data.senderId === senderId) {
                setMessages((prev) => {
                    const list = prev[convId] || [];
                    let ownMessageIndex = -1;
                    for (let i = list.length - 1; i >= 0; i--) {
                        if (list[i].isOwn) {
                            ownMessageIndex = i;
                            break;
                        }
                    }
                    if (ownMessageIndex === -1) return prev;
                    const nextList = [...list];
                    nextList[ownMessageIndex] = {
                        ...nextList[ownMessageIndex],
                        id: data.id || nextList[ownMessageIndex].id,
                        status: nextList[ownMessageIndex].status === 'read' ? 'read' : 'delivered',
                    };
                    return { ...prev, [convId]: nextList };
                });
            } else {
                const isCurrentChat = selectedChat && convId === selectedChat.id;
                const newMessage: Message = {
                    id: data.id || Date.now(),
                    text: data.message,
                    sender: data.senderId,
                    timestamp: new Date(),
                    isOwn: false,
                    status: (isCurrentChat ? 'read' : 'delivered') as 'read' | 'delivered' | 'sent',
                };

                setMessages((prev) => ({
                    ...prev,
                    [convId]: [...(prev[convId] || []), newMessage],
                }));

                setConversationsState((prev) =>
                    prev.map((c) =>
                        c.id === convId
                            ? {
                                ...c,
                                unreadCount: isCurrentChat ? 0 : Number(c.unreadCount || 0) + 1,
                                lastMessage: data.message,
                                lastMessageTime: new Date().toISOString(),
                            }
                            : c,
                    ),
                );

                if (isCurrentChat && data.id) {
                    hasMarkedAsReadRef.current.add(data.id);
                    const socket = getSocket();
                    socket.emit('on_message_read', {
                        messageId: data.id,
                        bookingId: convId,
                        conversationId: convId,
                        readerId: isInHost ? selectedChat.receiver.id : selectChatUserID,
                        senderId: !isInHost ? selectedChat.receiver.id : selectChatUserID,
                    });
                }
            }

            if (selectedChat && convId === selectedChat.id) {
                requestAnimationFrame(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                });
            }
        },
        [selectedChatID, senderId, selectedChat, isInHost, selectChatUserID],
    );

    const handleMessageRead = useCallback(
        (data: any) => {
            const { messageId, bookingId, conversationId } = data || {};
            const convId = bookingId || conversationId || selectedChatID;
            if (!convId) return;

            setMessages((prev) => {
                const list = prev[convId] || [];
                if (list.length === 0) return prev;
                if (messageId) {
                    const messageIndex = list.findIndex((m) => m.id === messageId);
                    if (messageIndex !== -1) {
                        const nextList = [...list];
                        nextList[messageIndex] = { ...nextList[messageIndex], status: 'read' as const };
                        return { ...prev, [convId]: nextList };
                    }
                }
                const nextListAll = list.map((m) =>
                    m.isOwn && m.status !== 'read' ? { ...m, status: 'read' as const } : m,
                );
                return { ...prev, [convId]: nextListAll };
            });
        },
        [selectedChatID],
    );

    // Socket Room management
    const currentRoomRef = useRef<string | number | null>(null);
    useEffect(() => {
        if (!bookingId) {
            currentRoomRef.current = null;
            return;
        }
        if (currentRoomRef.current === bookingId) return;

        const socket = getSocket();
        if (currentRoomRef.current) socket.emit('leave_room', currentRoomRef.current);
        socket.emit('join_room', bookingId);
        currentRoomRef.current = bookingId;

        socket.on('receive_message', handleReceiveMessage);
        socket.on('on_message_read', handleMessageRead);
        socket.on('message_read', handleMessageRead);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('on_message_read', handleMessageRead);
            socket.off('message_read', handleMessageRead);
            if (currentRoomRef.current) {
                socket.emit('leave_room', currentRoomRef.current);
                currentRoomRef.current = null;
            }
        };
    }, [bookingId, handleReceiveMessage, handleMessageRead]);

    // Consolidate scroll effects
    useEffect(() => {
        if (!selectedChat) return;
        // Scroll to bottom on switch ONLY if it's a new ID
        // Auto behavior is faster for initial switch
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
        firstLoadRef.current = true;
    }, [selectedChatID]);

    useEffect(() => {
        if (!selectedChat || !messages[selectedChat.id]?.length) return;
        if (firstLoadRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
            firstLoadRef.current = false;
        }
    }, [selectedChatID, messages[selectedChatID || -1]?.length]);

    const sendMessage = useCallback(() => {
        try {
            if (!message.trim() || !selectedChat) return;
            const socket = getSocket();
            if (!socket?.connected) {
                toast.error('Connection lost. Please check your internet connection.');
                return;
            }

            const messageText = message.trim();
            const newMessage: Message = {
                id: Date.now(),
                text: messageText,
                sender: senderId,
                timestamp: new Date(),
                isOwn: true,
                status: 'sent',
            };

            const chatId = selectedChat.id;
            setMessages((prev) => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMessage] }));
            setConversationsState((prev) =>
                prev.map((c) => (c.id === chatId ? { ...c, lastMessage: messageText, lastMessageTime: new Date().toISOString() } : c))
            );

            socket.emit('send_message', {
                senderId: isInHost ? selectedChat.receiver.id : selectChatUserID,
                isGuest: !isInHost,
                bookingId: selectedChat.booking.id,
                receiverId: !isInHost ? selectedChat.receiver.id : selectChatUserID,
                message: messageText,
            }, (response: any) => {
                if (response?.error) toast.error(response.error);
            });

            setMessage('');
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            });
        } catch (error) {
            handleApiError(error);
        }
    }, [message, selectedChat, senderId, isInHost, selectChatUserID]);

    const handleChatSelection = (chat: Conversation) => {
        if (selectedChatID === chat.id) {
            // If clicking the same chat, refetch booking details
            setShowSidebar(false);
            setBookingDetails(null);
            queryClient.invalidateQueries({ queryKey: ['lastBooking', chat.id], exact: true });
            refetchLastBooking({ cancelRefetch: false }).catch(() => { });
            return;
        }
        setSelectedChat(chat);
        setShowSidebar(false);
        setPage(1);
        setHasMore(true);
        firstLoadRef.current = true;
        hasMarkedAsReadRef.current.clear();
        setBookingDetails(null);
        if (chat?.id) {
            queryClient.invalidateQueries({ queryKey: ['lastBooking', chat.id], exact: true });
        }
    };

    const loadNextPage = () => {
        if (hasMore) setPage((prev) => prev + 1);
    };

    return {
        isInHost,
        basePath,
        selectedChat,
        setSelectedChat: handleChatSelection,
        message,
        setMessage,
        messages,
        conversationsState,
        setConversationsState,
        filteredConversations,
        searchTerm,
        setSearchTerm,
        active,
        setActive,
        showSidebar,
        setShowSidebar,
        showDetails,
        setShowDetails,
        page,
        hasMore,
        bookingDetails,
        setBookingDetails,
        isAcceptOpen,
        setIsAcceptOpen,
        isRejectOpen,
        setIsRejectOpen,
        selectedRow,
        conversationsLoading,
        messagesEndRef,
        sendMessage,
        loadNextPage,
        refetchLastBooking,
        isLoadingBooking
    };
}
