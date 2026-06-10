'use client';
import { useRouter } from 'next/navigation';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ChevronDown, UserIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/button';
import { PATHS } from '@/constants/path';
import { GUEST_ACCOUNT_OPTIONS, HOST_ACCOUNT_OPTIONS } from '../layout/header-components/headerConstants';

interface ProfileDropdownProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    userData: any;
    accountOptions: typeof HOST_ACCOUNT_OPTIONS | typeof GUEST_ACCOUNT_OPTIONS;
    isHostMode: boolean;
    onLogout: () => void;
}

const ProfileDropdown = ({
    isOpen,
    onOpenChange,
    userData,
    accountOptions,
    isHostMode,
    onLogout,
}: ProfileDropdownProps) => {
    const hostProfileUrl = `${PATHS.GUEST_HOST_PROFILE}/${userData?.id}`;
    const guestProfileUrl = `${PATHS.GUEST_DETAILS}/${userData?.id}`;

    const dynamicProfileUrl = isHostMode ? hostProfileUrl : guestProfileUrl;
    const dynamicProfileLabel = isHostMode ? 'Host Profile' : 'Guest Profile';

    return (
        <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer border border-gray-200 rounded-full pl-3 pr-2 py-2 shadow-sm">
                    {userData?.avatar ? (
                        <Image
                            src={userData.avatar}
                            alt="user avatar"
                            width={40}
                            height={40}
                            className="rounded-full w-10 h-10 object-cover"
                        />
                    ) : (
                        <UserIcon className="w-8 h-8 text-gray-400" />
                    )}
                    <ChevronDown
                        className={`${isOpen && 'rotate-180'} duration-150 h-5 w-5 text-gray-600`}
                    />
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white rounded-md shadow-lg mt-2" align="end">
                {accountOptions.map((item) => (
                    <DropdownMenuItem asChild key={item.key}>
                        <Link href={item.link} className="w-full px-4 py-3 text-zinc-800 text-sm">
                            {item.title}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuItem asChild>
                    <Link
                        href={dynamicProfileUrl}
                        className="w-full px-4 py-3 text-zinc-800 text-sm"
                    >
                        {dynamicProfileLabel}
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={onLogout}
                    className="w-full px-4 py-3 text-zinc-800 text-sm cursor-pointer"
                >
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ProfileDropdown;
