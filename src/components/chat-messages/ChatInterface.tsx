'use client';

import { MessageSquare } from 'lucide-react';
import Sidebar from '@/components/chat-messages/Sidebar';
import ChatHeader from '@/components/chat-messages/ChatHeader';
import ChatMessages from '@/components/chat-messages/ChatMessages';
import ChatInput from '@/components/chat-messages/ChatInput';
import Booking from '@/components/chat-messages/Booking';
import BookingDetailsSidebar from '@/components/chat-messages/BookingDetailsSidebar';
import AcceptReservationModal from '../modals/AcceptReservationModal';
import { CancelReservationModal } from '../modals/CancelReservationModal';
import Image from 'next/image';
import yellowTick from '@/assets/yellow-tick.svg';
import { useChatInterfaceLogic } from '@/hooks/useChatInterfaceLogic';
import { transformToReservation } from '@/utils/chatMappers';

export default function ChatInterface() {
    const {
        isInHost,
        basePath,
        selectedChat,
        setSelectedChat,
        message,
        setMessage,
        messages,
        conversationsState,
        setConversationsState,
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
    } = useChatInterfaceLogic();

    const filteredConversations = conversationsState;

    return (
        <div className="bg-white h-full flex">
            <Sidebar
                conversations={filteredConversations}
                active={active}
                setActive={setActive}
                selectedChat={selectedChat}
                setSelectedChat={setSelectedChat}
                showSidebar={showSidebar}
                setShowSidebar={setShowSidebar}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isInHost={isInHost}
                bookingDetails={bookingDetails}
                setBookingData={setBookingDetails}
                setConversations={setConversationsState}
            />

            <div className={`flex-1 flex flex-col ${showSidebar ? 'hidden md:flex' : 'flex'}`}>
                {conversationsLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center px-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F6CD28] mx-auto mb-4"></div>
                            <h3 className="text-gray-400 font-medium">Loading conversations...</h3>
                        </div>
                    </div>
                ) : selectedChat ? (
                    <>
                        {showDetails ? (
                            <div className="h-screen md:hidden overflow-y-auto bg-gray-50 p-4">
                                <Booking
                                    handleBackToChatList={() => setShowDetails(false)}
                                    bookingDetails={bookingDetails}
                                    isInHost={isInHost}
                                    setRejectedModalView={setIsRejectOpen}
                                    setAcceptModalView={setIsAcceptOpen}
                                    refreshBookingDetails={refetchLastBooking}
                                />
                            </div>
                        ) : (
                            <>
                                <ChatHeader
                                    selectedChat={selectedChat}
                                    setShowSidebar={setShowSidebar}
                                    setShowDetails={setShowDetails}
                                    bookingDetails={bookingDetails}
                                    isInHost={isInHost}
                                />
                                <ChatMessages
                                    selectedChat={selectedChat}
                                    messages={messages}
                                    messagesEndRef={messagesEndRef}
                                    hasMore={hasMore}
                                    loadNextPage={loadNextPage}
                                    page={page}
                                />
                                <ChatInput
                                    message={message}
                                    setMessage={setMessage}
                                    sendMessage={sendMessage}
                                    bookingDetails={bookingDetails}
                                />
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center px-4">
                            <MessageSquare
                                className={`w-12 h-12 text-gray-300 ${filteredConversations?.length === 0 ? 'ml-20' : 'ml-64'
                                    }`}
                            />
                            <h3 className="text-gray-400 font-medium text-xl">
                                {filteredConversations?.length === 0
                                    ? 'No Messages Available!'
                                    : 'Select a chat to preview the conversation and view host details.'}
                            </h3>
                        </div>
                    </div>
                )}
            </div>

            {selectedChat && (
                <div className="hidden md:block w-1/4 bg-white h-full overflow-y-auto">
                    <BookingDetailsSidebar
                        bookingDetails={bookingDetails}
                        basePath={basePath}
                        isInHost={isInHost}
                        refreshBookingDetails={refetchLastBooking}
                        setRejectedModalView={setIsRejectOpen}
                        setAcceptModalView={setIsAcceptOpen}
                        isLoading={isLoadingBooking}
                    />
                </div>
            )}

            <AcceptReservationModal
                isVisible={isAcceptOpen}
                icon={<Image width={60} height={60} alt="tick" src={yellowTick} unoptimized />}
                title="Booking Request Accepted"
                onClose={() => setIsAcceptOpen(false)}
                spaceData={transformToReservation(selectedRow)}
            />

            <CancelReservationModal
                open={isRejectOpen}
                spaceData={transformToReservation(selectedRow)}
                onClose={() => setIsRejectOpen(false)}
                reservationId={selectedRow?.id}
                onSuccess={() => refetchLastBooking()}
                isCancel={false}
                isBookingRequest={true}
            />
        </div>
    );
}
