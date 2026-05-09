'use client';

import React from 'react';
import YouTube from 'react-youtube';
import Typography from '../ui/typoGraphy';

const videos = [
    { id: 1, videoUrl: 'https://youtube.com/shorts/h2FZy4guYuU?si=all5gDr1FgrYz-k9' },
    { id: 2, videoUrl: 'https://youtube.com/shorts/DE4fcZk6u2k?si=IYfhK-9ZKPEY1Fgf' },
    { id: 3, videoUrl: 'https://youtube.com/shorts/tkTworb2hH4?si=a5fs2akRbut4YTsm' },
    { id: 4, videoUrl: 'https://youtube.com/shorts/qcuF2V1piI0?feature=share' },
    { id: 5, videoUrl: 'https://www.youtube.com/shorts/BmYHI82bEYk?si=2Q6ZH6cDs6Z4ckkW' },
];

function extractVideoId(url: string) {
    const match = url.match(/(?:v=|shorts\/|embed\/)([\w-]+)/);
    return match ? match[1] : '';
}

function DesktopVideos(props: { opts: any }) {
    return (
        <div className="hidden md:flex flex-nowrap gap-6 justify-center mt-10 overflow-x-auto no-scrollbar pb-4">
            {videos.map(function (video) {
                const videoId = extractVideoId(video.videoUrl);
                return (
                    <div key={video.id} className="rounded-2xl overflow-hidden shadow-md">
                        <YouTube
                            videoId={videoId}
                            opts={{
                                ...props.opts,
                                playerVars: { ...props.opts.playerVars, playlist: videoId },
                            }}
                            className="rounded-2xl"
                        />
                    </div>
                );
            })}
        </div>
    );
}

function MobileCarousel(props: { opts: any }) {
    return (
        <div className="md:hidden mt-8 overflow-x-auto flex gap-4 snap-x snap-mandatory pb-3 no-scrollbar">
            {videos.map(function (video) {
                const videoId = extractVideoId(video.videoUrl);
                return (
                    <div
                        key={video.id}
                        className="snap-center shrink-0 w-[260px] rounded-2xl overflow-hidden shadow-md"
                    >
                        <YouTube
                            videoId={videoId}
                            opts={{
                                ...props.opts,
                                width: '100%',
                                playerVars: { ...props.opts.playerVars, playlist: videoId },
                            }}
                            className="rounded-2xl"
                        />
                    </div>
                );
            })}
        </div>
    );
}

export default function SpareSpaceVideoSection() {
    const opts = {
        height: '450',
        width: '250',
        playerVars: {
            autoplay: 1,
            mute: 1,
            loop: 1,
            controls: 0,
            playlist: '',
            modestbranding: 1,
        },
    };

    return (
        <section className="w-full py-4 px-4 md:px-16 relative overflow-hidden mt-8">
            <div className="flex flex-col items-center text-center gap-4 relative z-10 mb-8">
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    See <span className="text-[#F7CD29]">Spare Space</span> Live
                </h2>
                <p className="text-black text-sm md:text-lg font-medium max-w-xl mx-auto">
                    Watch how easy it is to find, book, and experience the perfect space tailored
                    perfectly to your specific ideas and needs.
                </p>
            </div>

            <DesktopVideos opts={opts} />
            <MobileCarousel opts={opts} />
        </section>
    );
}
