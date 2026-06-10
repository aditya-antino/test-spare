import Image from 'next/image';
import Typography from '@/components/ui/typoGraphy';
import HomePageSearchBarTab from './HomePageSearchBarTab';
import { heroImage01, heroImage02, heroImage03 } from '@/assets';

export default function HeroHomeSection() {
    return (
        <section className="bg-white w-full pt-12 px-4 md:px-16 relative">
            {/* Background Glow */}
            <div className="w-96 h-96 opacity-30 bg-amber-200 absolute z-50 -top-[15%] hidden md:block left-[9%] rounded-full blur-3xl" />

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Left Content */}
                <div className="flex-1 md:mt-12">
                    <div className="self-stretch">
                        <span className="text-zinc-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            Find the Perfect Space for{' '}
                        </span>
                        <span className="text-[#F7D13A] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            Work
                        </span>
                        <span className="text-zinc-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            ,{' '}
                        </span>
                        <span className="text-[#F7D13A] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            Creativity
                        </span>
                        <span className="text-zinc-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            , and{' '}
                        </span>
                        <span className="text-[#F7D13A] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            Events
                        </span>
                        <span className="text-zinc-800 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-['Figtree'] leading-snug sm:leading-tight md:leading-[64px] lg:leading-[72px]">
                            .
                        </span>
                    </div>
                    <Typography className="mt-4" color="text-gray-500" size="xl" weight="normal">
                        Book by the hour. Flexible, affordable, and hassle-free.
                    </Typography>
                    {/* Search Bar */}
                    <HomePageSearchBarTab className="absolute w-[95%] lg:w-[85%] max-w-6xl px-6 z-[40] pr-3 py-2 top-[68%] left-1/2 -translate-x-1/2" />
                </div>

                {/* Right Images */}
                <div className="hidden md:grid grid-cols-2 gap-4">
                    <Image
                        src={heroImage01}
                        alt="Studio setup"
                        width={250}
                        height={100}
                        priority
                        className="rounded-lg object-contain hover:scale-[1.02] hover:z-0 transition-all duration-300"
                    />

                    <Image
                        src={heroImage03}
                        alt="Music production"
                        width={250}
                        height={800}
                        priority
                        className="rounded-lg object-cover row-span-3 translate-y-16 hover:scale-[1.02] hover:z-0 transition-all duration-300"
                    />

                    <Image
                        src={heroImage02}
                        alt="Music production"
                        width={250}
                        height={100}
                        priority
                        className="rounded-lg object-cover hover:scale-[1.02] hover:z-0 transition-all duration-300"
                    />
                </div>
            </div>
        </section>
    );
}
