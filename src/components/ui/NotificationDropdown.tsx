'use client';

import { NotificationItem } from './NotificationItem';
import { useRouter } from 'next/navigation';
import { useClearAllNotification, useNotification } from '@/services';
import { Button } from './button';
import { handleApiError } from '@/hooks/handleApiError';
import { useState } from 'react';
import { isPending } from '@reduxjs/toolkit';

export interface Notification {
    id: string | number;
    title: string;
    message: string;
    timeAgo: string;
}

interface NotificationDropdownProps {
    isHostMode: boolean;
    refectNotificationCount: () => void;
}

function formatDateTime(dateString: string) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function NotificationDropdown({
    isHostMode = false,
    refectNotificationCount,
}: NotificationDropdownProps) {
    const roleId = isHostMode ? 2 : 3;

    const {
        data: notificationsData,
        isLoading,
        error,
        refetch: refetchNotifications,
    } = useNotification(roleId, {
        refetchInterval: 120000,
        refetchIntervalInBackground: true,
    });

    const { mutate: clearAll, isPending: isClearing } = useClearAllNotification(roleId);

    const notifications = notificationsData?.data || [];

    const transformedNotifications = notifications.map(function (notification: any) {
        let messageText = notification.description;

        if (typeof notification.description === 'object' && notification.description !== null) {
            messageText =
                notification.description.message ||
                notification.description.description ||
                JSON.stringify(notification.description);
        }

        return {
            id: notification.id,
            title: notification.title,
            message: messageText,
            timeAgo: formatDateTime(notification.created_at),
            url: notification.url,
        };
    });

    function handleNotificationClick(url: string) {
        if (url) {
            const cleanUrl = url.startsWith('/') ? url : `/${url}`;
            window.location.href = cleanUrl;
        }
    }

    function handleClearAll() {
        clearAll(undefined, {
            onSuccess: () => {
                refetchNotifications();
                refectNotificationCount();
            },
            onError: handleApiError,
        });
    }

    if (isLoading) {
        return (
            <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200">
                <div className="max-h-80 overflow-hidden">
                    {Array.from({ length: 3 }).map(function (_, index) {
                        return (
                            <div key={index} className="p-4 border-b border-gray-100">
                                <div className="animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200">
                <div className="p-4 text-sm text-red-500 text-center">
                    Failed to load notifications
                </div>
            </div>
        );
    }

    return (
        <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50 border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>

                <Button variant="outline" size="sm" onClick={handleClearAll} disabled={isClearing}>
                    {isClearing ? 'Clearing...' : 'Clear All'}
                </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
                {transformedNotifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
                ) : (
                    transformedNotifications.map(function (notification) {
                        return (
                            <NotificationItem
                                key={notification.id}
                                title={notification.title}
                                message={notification.message}
                                timeAgo={notification.timeAgo}
                                onClick={function () {
                                    handleNotificationClick(notification.url);
                                }}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
