'use client';
import React from 'react';
import Image from 'next/image';
import ArrowScrollWrapper from '@/components/ui/arrowScrollWrapper';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setSelectedCategories, setSelectedActivities } from '@/store/slice/homePageSearchSlice';
import { toast } from 'react-toastify';
import {
    podcastIcon,
    camera,
    Exhibiton,
    Meeting,
    spotlight,
    Videoshoot,
    Wellness,
    Workshop,
} from '@/assets/activitiesIcon';

const STATIC_ACTIVITIES = [
    { activity: 'Photoshoot', icon: camera, id: 'photoshoot', key: 'photoshoot' },
    { activity: 'Video Shoot', icon: Videoshoot, id: 'video-shoot', key: 'video-shoot' },
    { activity: 'Workshop', icon: Workshop, id: 'workshop', key: 'workshop' },
    { activity: 'Podcast', icon: podcastIcon, id: 'podcast', key: 'podcast' },
    { activity: 'Meeting', icon: Meeting, id: 'meeting', key: 'meeting' },
    { activity: 'Events', icon: spotlight, id: 'events', key: 'events' },
    { activity: 'Exhibition', icon: Exhibiton, id: 'exhibition', key: 'exhibition' },
    { activity: 'Wellness', icon: Wellness, id: 'wellness', key: 'wellness' },
];

export default function BrowseByActivities() {
    const router = useRouter();
    const dispatch = useDispatch();

    function handlePressSearch(activity: any) {
        if (activity) {
            dispatch(setSelectedCategories([]));
            dispatch(
                setSelectedActivities([
                    {
                        name: activity.activity,
                        ids: [], // Since it's static now, we pass empty ids or handle it in search page
                    },
                ]),
            );
            router.push('/space-list');
            return;
        }
        toast.error('Something went wrong!!');
    }

    return (
        <section className="pt-8 pb-2 px-4 md:px-16 flex flex-col items-center w-full bg-white">
            <div className="text-center mb-6 flex flex-col items-center">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">
                    Browse spaces by <span className="text-[#F7CD29]">Activity</span>
                </h2>
                <p className="text-black text-sm md:text-base font-medium mt-2 max-w-xl">
                    Whether you're hosting an event, recording a podcast, or planning a photoshoot,
                    we have the ideal space for you.
                </p>
            </div>

            <div className="w-full flex justify-center">
                <ArrowScrollWrapper
                    autoScroll={true}
                    gapClassName="gap-6 md:gap-10"
                    arrowTopClassName="hidden md:flex md:top-[12px]"
                >
                    {STATIC_ACTIVITIES.map((activity: any) => {
                        return (
                            <div
                                key={activity.key}
                                className="flex flex-col items-center gap-3 cursor-pointer group min-w-[110px] px-2 pb-1 pt-1 transition-transform duration-300 ease-in-out hover:scale-[1.03]"
                                onClick={() => handlePressSearch(activity)}
                            >
                                <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 group-hover:border-[#F7CD29]/50 group-hover:bg-[#F7CD29]/[0.03] group-hover:shadow-[0_4px_12px_rgba(247,205,41,0.15)]">
                                    <Image
                                        src={activity.icon}
                                        alt={activity.activity}
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                                    />
                                </div>
                                <p className="text-sm md:text-base font-semibold text-gray-700 group-hover:text-gray-900 whitespace-nowrap text-center transition-colors">
                                    {activity?.activity || 'Untitled'}
                                </p>
                            </div>
                        );
                    })}
                </ArrowScrollWrapper>
            </div>
        </section>
    );
}
