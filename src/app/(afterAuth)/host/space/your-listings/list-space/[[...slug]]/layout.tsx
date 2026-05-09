'use client';
import { DeleteSpaceModal } from '@/components/modals/DeleteSpaceModal';
import { Button } from '@/components/ui/button';
import Typography from '@/components/ui/typoGraphy';
import { PATHS } from '@/constants/path';
import { useDeleteSpace } from '@/services';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RootState } from '@/store/store';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Layout = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const searchParams = useSearchParams();
    const spaceId = searchParams.get('spaceId');
    const isDraft = searchParams.get('isDraft') || false;
    const step = searchParams.get('step');
    const router = useRouter();
    const isEdit = searchParams.get('isEdit');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const { mutate: deleteSpace, isPending: isDeleteLoading } = useDeleteSpace({
        onSuccess: (res) => {
            toast.success(res.message);
            router.replace(PATHS.YOUR_LISTING);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    const handleDeleteSpace = () => {
        deleteSpace({ spaceIds: [Number(spaceId)] });
    };

    const handleGoBack = () => {
        if (Number(step) - 1 > 0) {
            router.replace(`${PATHS.SPACE_LIST_PATH}?spaceId=${spaceId}&step=${Number(step) - 1}&isEdit=true`);
        } else if (Number(step) - 1 < 1 || step === 'completed') {
            router.replace(`${PATHS.YOUR_LISTING}`);
        }
    };

    const userData: any = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (userData?.user && userData.user.isProfileCompleted === false) {
            router.replace(PATHS.YOUR_LISTING);
            toast.warn('Please complete your profile!');
        }
    }, [userData, router]);

    return (
        <div className="flex flex-col gap-6 mt-2 px-4 md:px-10 lg:px-20 pb-10">
            <ArrowLeft onClick={handleGoBack} className="cursor-pointer mt-3 md:mt-7" />
            <div className="flex items-center w-full justify-between">
                <Typography
                    onClick={() => {
                        router.replace(PATHS.SPACE_LIST_PATH);
                    }}
                    size="4xl"
                    weight="bold"
                    color="text-[#F6CD28]"
                >
                    List a Space
                </Typography>
                {isEdit && (
                    <div className="flex items-center gap-4">
                        {!isDraft && (
                            <Button
                                onClick={() => {
                                    router.push(`${PATHS.DEACTIVATE_SPACE}?spaceId=${spaceId}`);
                                }}
                                variant="outline"
                            >
                                Deactivate
                            </Button>
                        )}
                        <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                            Delete
                        </Button>
                    </div>
                )}
            </div>
            <DeleteSpaceModal
                isLoading={isDeleteLoading}
                open={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onSuccess={() => {
                    handleDeleteSpace();
                }}
            />
            {step !== 'completed' && (
                <div className="self-stretch justify-start">
                    <span className="text-gray-900 text-4xl font-semibold font-['Figtree'] leading-10">
                        0{step || 1}
                    </span>
                    <span className="text-gray-900 text-2xl font-semibold font-['Figtree'] leading-loose">
                        {' '}
                    </span>
                    <span className="text-gray-500 text-lg font-normal font-['Figtree'] leading-7">
                        / 09
                    </span>
                </div>
            )}
            {children}
        </div>
    );
};

export default Layout;
