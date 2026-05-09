'use client';

import { useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { useGetProfile, useGetRoles } from '@/services';
import { setUserProfile, setUserRole } from '@/store/slice/authSlice';
import { useDispatch } from 'react-redux';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { data } = useGetProfile();
    const { data: roles } = useGetRoles();
    const dispatch = useDispatch();

    useEffect(() => {
        if (data?.data && roles?.data) {
            const userRoleIds: number[] = data?.data?.roles || [];

            // Find role objects matching userRoleIds
            const userRoles = roles.data.filter((role: any) => userRoleIds.includes(role.id));

            // Get all role names as lowercase (or keep original if you want)
            const roleNames = userRoles.map((role: any) => role.name?.toLowerCase() || '');

            // Save array of roles in localStorage
            dispatch(setUserProfile(data.data));
            dispatch(setUserRole(roleNames));
            localStorage.setItem('userRoles', JSON.stringify(roleNames));
            localStorage.setItem('userData', JSON.stringify(data.data));
        }
    }, [data, roles]);

    return (
        <div className="h-screen max-h-screen flex flex-col">
            <Header />
            <main className="h-full">{children}</main>
        </div>
    );
}
