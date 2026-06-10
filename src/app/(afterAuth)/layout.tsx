'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { useGetProfile, useGetRoles } from '@/services';
import { setUserProfile, setUserRole } from '@/store/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function AfterAuthLayout({ children }: React.PropsWithChildren) {
    const { data } = useGetProfile();
    const { data: roles } = useGetRoles();
    const dispatch = useDispatch();

    // Get current state to avoid redundant updates
    const currentProfile = useSelector((state: RootState) => state.auth.user);
    const currentRoles = useSelector((state: RootState) => state.auth.userRole);

    useEffect(() => {
        if (data?.data && roles?.data) {
            const userRoleIds: number[] = data.data.roles || [];

            // Find role objects matching userRoleIds
            const userRoles = roles.data.filter((role: { id: string | number; name: string }) =>
                userRoleIds.includes(Number(role.id)),
            );

            // Get all role names as lowercase
            const roleNames = userRoles.map(
                (role: { id: string | number; name: string }) => role.name?.toLowerCase() || '',
            );

            // Check if data actually changed before dispatching
            const profileChanged = JSON.stringify(currentProfile) !== JSON.stringify(data.data);
            const rolesChanged = JSON.stringify(currentRoles) !== JSON.stringify(roleNames);

            if (profileChanged || rolesChanged) {
                // Save to Redux
                dispatch(setUserProfile(data.data));
                dispatch(setUserRole(roleNames));

                // Save to localStorage
                try {
                    localStorage.setItem('userRoles', JSON.stringify(roleNames));
                    localStorage.setItem('userData', JSON.stringify(data.data));
                } catch (error) {
                    console.error('Error saving to localStorage:', error);
                }
            }
        }
    }, [data, roles, dispatch, currentProfile, currentRoles]);

    return (
        <div className="h-screen max-h-screen flex flex-col">
            <Header />
            <main className="h-full">{children}</main>
        </div>
    );
}
