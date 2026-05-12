'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import Image from 'next/image';
import logo from '@/assets/logo.svg';
import NextLink from 'next/link';
import { PATHS } from '@/constants/path';
import { User, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiUser {
    id: number;
    firstName: string;
    lastName?: string;
    email?: string;
}

interface UserSelectionProps {
    users: MultiUser[];
    onSelect: (userId: number) => void;
    onBack: () => void;
    isVerifying: boolean;
}

const UserSelection = ({ users, onSelect, onBack, isVerifying }: UserSelectionProps) => {
    const [selectedId, setSelectedId] = React.useState<number | null>(null);

    return (
        <div className="w-full mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-6">
                <NextLink href={PATHS.HOME_PAGE} className="inline-block transition-transform hover:scale-105 duration-300">
                    <Image src={logo} alt="Logo" width={180} height={92} className="mx-auto" />
                </NextLink>

                <div className="space-y-2">
                    <Typography size="2xl" weight="bold" className="text-gray-900 tracking-tight" align="center">
                        Multiple Accounts Found
                    </Typography>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                        Please select the account you wish to sign in with.
                    </p>
                </div>
            </div>

            {/* User List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                {users.filter(user => user.firstName || user.lastName).map((user) => (
                    <div
                        key={user.id}
                        onClick={() => !isVerifying && setSelectedId(user.id)}
                        className={cn(
                            "group relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2",
                            selectedId === user.id 
                                ? "bg-[#F6CD28]/10 border-[#F6CD28] shadow-lg shadow-[#F6CD28]/5" 
                                : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-md active:scale-[0.98]"
                        )}
                    >
                        <div className={cn(
                            "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300",
                            selectedId === user.id ? "bg-[#F6CD28] text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                        )}>
                            <User className="w-6 h-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <Typography size="lg" weight="bold" className="text-gray-900 truncate">
                                {user.firstName} {user.lastName}
                            </Typography>
                            {user.email && (
                                <div className="flex items-center gap-1.5 text-gray-500 mt-0.5">
                                    <Mail className="w-3.5 h-3.5" />
                                    <span className="text-xs truncate">{user.email}</span>
                                </div>
                            )}
                        </div>

                        {selectedId === user.id && (
                            <div className="animate-in zoom-in duration-300">
                                <CheckCircle2 className="w-6 h-6 text-[#F6CD28]" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
                <Button
                    onClick={() => selectedId && onSelect(selectedId)}
                    disabled={!selectedId || isVerifying}
                    className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 hover:shadow-[#F6CD28]/20"
                >
                    {isVerifying ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Signing in...</span>
                        </div>
                    ) : (
                        'Continue to Login'
                    )}
                </Button>

                <button
                    onClick={onBack}
                    disabled={isVerifying}
                    className="flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 transition-colors py-2 group"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    <span className="text-sm font-semibold">Back to OTP</span>
                </button>
            </div>
        </div>
    );
};

export default UserSelection;
