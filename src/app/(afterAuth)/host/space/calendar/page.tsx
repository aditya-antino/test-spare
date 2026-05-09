'use client';

import React from 'react';
import { CalendarHeader } from '@/components/calendar/CalendarHeader';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { DailyCalendar } from '@/components/calendar/DailyCalendar';
import EditListingDrawer from './editListingDrawer';
import { BlockTimeDrawer } from './blockTimeDrawer';
import BookingDetails from './bookingDetails';
import { FullDayBlocker } from './fullDayBlocker';
import BlockTimeSlotDeleteModal from './blockTimeSlotDeleteModal';
import { CalendarSkeleton } from '@/components/skeletons';
import dayjs from 'dayjs';
import { useHostCalendar } from './useHostCalendar';

export default function CalendarPage() {
    const {
        viewType, setViewType,
        selectedDate,
        currentDate, setCurrentDate,
        isDeleteSlotModal, setIsDeleteSlotModal,
        selectedSpace, setSelectedSpace,
        isEditDrawer, setIsEditDrawer,
        isBlockTimeDrawer, setIsBlockTimeDrawer,
        isDetails, setIsDetails,
        selectedSpaceId, setSelectedSpaceId,
        isFullDayBlockDrawer, setIsFullDayBlockDrawer,
        slotId, setSlotId,
        clickedTime,
        suggestedEndTime,
        setDateRange,
        spaces, isSpaceLoading,
        selectedSpaceData, isSelectedSpaceDataLoading,
        blockedSlots, refechBlockedSlots,
        deleteBlockedSlot,
        monthlyDataApi,
        isClosedDay,
        handleDayClick,
        handleStripClick,
        existingSlots,
        convertAvailableToBlocked
    } = useHostCalendar();

    return isSpaceLoading ? (
        <CalendarSkeleton />
    ) : (
        <div className="space-y-6 md:p-6 h-full flex flex-col">
            <CalendarHeader
                isLoading={isSpaceLoading}
                spaces={spaces?.data?.rows}
                currentDate={currentDate}
                selectedSpace={selectedSpace}
                viewType={viewType}
                onDateChange={({ startDate, endDate }) => {
                    setDateRange({ startDate, endDate });
                    setCurrentDate(dayjs(startDate).format('YYYY-MM-DD'));
                }}
                onSpaceChange={(space) => setSelectedSpace(space)}
                onViewTypeChange={setViewType}
                onEditListing={() => setIsEditDrawer(true)}
            />

            <EditListingDrawer
                spaceId={selectedSpace?.id}
                onOpenChange={setIsEditDrawer}
                open={isEditDrawer}
            />

            <BlockTimeDrawer
                onSuccess={refechBlockedSlots}
                date={selectedDate ?? currentDate}
                selectedId={selectedSpace?.id}
                onOpenChange={setIsBlockTimeDrawer}
                open={isBlockTimeDrawer}
                clickedTime={clickedTime}
                suggestedEndTime={suggestedEndTime || { hour: 0, minute: 0 }}
                existingSlots={existingSlots}
            />

            <FullDayBlocker
                onSuccess={refechBlockedSlots}
                date={selectedDate}
                selectedId={selectedSpace?.id}
                onOpenChange={setIsFullDayBlockDrawer}
                open={isFullDayBlockDrawer}
            />

            <BookingDetails
                isLoading={isSelectedSpaceDataLoading}
                data={selectedSpaceData?.data?.rows?.[0]}
                open={isDetails}
                isInCalendor={true}
                onClose={() => setIsDetails(false)}
            />

            <BlockTimeSlotDeleteModal
                open={isDeleteSlotModal}
                onClose={() => setIsDeleteSlotModal(false)}
                onDelete={() => slotId && deleteBlockedSlot({ slotId })}
            />

            <div className="flex-1">
                {viewType === 'monthly' ? (
                    <MonthlyCalendar
                        onBlockStrip={(_, id) => {
                            setSlotId(id);
                            setIsDeleteSlotModal(true);
                        }}
                        apiData={monthlyDataApi?.data?.calendar || []}
                        onDayClick={handleDayClick}
                        selectedDate={selectedDate ?? undefined}
                        blockedData={convertAvailableToBlocked(
                            blockedSlots?.data?.bookingSlots || [],
                        )}
                        isClosedDay={isClosedDay}
                        month={dayjs(currentDate).format('YYYY-MM')}
                    />
                ) : (
                    <DailyCalendar
                        onBlockStrip={(id) => {
                            setSlotId(id);
                            setIsDeleteSlotModal(true);
                        }}
                        onStripClick={handleStripClick}
                        bookings={existingSlots}
                        onColorStrip={(id) => {
                            setSelectedSpaceId(id);
                            setIsDetails(true);
                        }}
                        operatingHours={monthlyDataApi?.data?.operatingHours}
                        currentDate={currentDate}
                    />
                )}
            </div>
        </div>
    );
}
