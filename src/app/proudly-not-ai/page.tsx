import { Metadata } from 'next';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import ScrollToTop from './ScrollToTop';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get('host');

    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const title = 'Proudly Not AI - Spare Space';
    const description = "Every photo on Spare Space is real. Taken by real photographers, of real spaces you can actually walk into. If a space doesn't match its photos, get 100% of your money back.";

    return {
        title,
        description,
        alternates: {
            canonical: `${baseUrl}/proudly-not-ai`,
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}/proudly-not-ai`,
            siteName: 'Spare Space',
            images: [
                {
                    url: `${baseUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: 'Proudly Not AI - Spare Space',
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`${baseUrl}/og-image.png`],
        },
        other: {
            'theme-color': '#F6CD28',
        },
    };
}

export const viewport = {
    themeColor: '#F6CD28',
};

export default function ProudlyNotAiPage() {
    return (
        <>
            <ScrollToTop />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

            <div className="min-h-screen bg-white">
                <Header />

                <div 
                    className="bg-white text-[#111111] antialiased leading-relaxed text-base w-full min-h-screen overflow-x-hidden block"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                >

                {/* HERO */}
                <section className="py-[70px] md:py-[120px] pb-[60px] md:pb-[100px] bg-gradient-to-br from-white to-[#FAFAF7] border-b border-[#111111]/10 relative overflow-hidden">
                    <div className="absolute -top-[300px] -right-[120px] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(246,205,40,0.05)_0%,_transparent_70%)] rounded-full pointer-events-none" />

                    <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-1">
                        <div className="inline-flex items-center gap-2.5 px-4.5 py-2.5 bg-white/80 backdrop-blur-[10px] border border-[#111111]/15 rounded-full text-[13px] font-semibold text-[#555555] mb-8 animate-fade-in-up [animation-delay:100ms]">
                            <span className="w-2 h-2 bg-[#F6CD28] rounded-full animate-glow"></span>
                            The Spare Space pledge · Launched 2026
                        </div>
                        <h1 className="text-[clamp(48px,7.5vw,96px)] leading-[0.95] font-extrabold tracking-[-0.035em] mb-8 animate-fade-in-up [animation-delay:200ms]">
                            Proudly <span className="bg-gradient-to-br from-[#F6CD28] to-[#f5b800] px-4 pb-1.5 rounded-2xl inline-block shadow-[0_8px_24px_rgba(246,205,40,0.25)] -skew-x-[5deg]">Not AI.</span>
                        </h1>
                        <p className="text-[clamp(18px,1.8vw,22px)] max-w-[720px] text-[#555555] leading-relaxed font-normal mb-2 animate-fade-in-up [animation-delay:300ms]">
                            Every photo on Spare Space is real. Taken by real photographers. Of real spaces you can actually walk into. <strong className="text-[#111111] font-bold">Here&apos;s exactly what that means, and how we make sure of it.</strong>
                        </p>
                    </div>
                </section>

                {/* PLEDGE */}
                <section className="py-[70px] md:py-[100px] border-b border-[#111111]/10 bg-gradient-to-b from-white to-[#FAFAF7]">
                    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                        <div className="mb-16 max-w-[720px] animate-fade-in-up">
                            <h2 className="text-[clamp(32px,4vw,44px)] leading-tight tracking-[-0.025em] font-extrabold mb-5">Three rules we don&apos;t break.</h2>
                            <p className="text-lg text-[#555555] leading-relaxed font-normal">This is how every photo on Spare Space comes to exist — what we do, and what we refuse to do.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                            <div className="bg-white/60 backdrop-blur-[10px] border-[1.5px] border-[#111111]/15 rounded-[24px] px-8 py-10 transition-all duration-350 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden hover:border-[#111111] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group animate-fade-in-up [animation-delay:100ms]">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F6CD28] to-[#f5b800] rounded-[18px] flex items-center justify-center text-[28px] mb-7 shadow-[0_8px_20px_rgba(246,205,40,0.2)] transition-transform duration-300 group-hover:scale-112 group-hover:rotate-5">✕</div>
                                <h3 className="text-[22px] font-extrabold mb-3 leading-snug tracking-tight">Zero AI-generated images.</h3>
                                <p className="text-base text-[#555555] leading-relaxed font-normal">Not &quot;AI-enhanced.&quot; Not &quot;AI cleanup.&quot; Zero. If you see it on a listing, a camera took it.</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-[10px] border-[1.5px] border-[#111111]/15 rounded-[24px] px-8 py-10 transition-all duration-350 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden hover:border-[#111111] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group animate-fade-in-up [animation-delay:200ms]">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F6CD28] to-[#f5b800] rounded-[18px] flex items-center justify-center text-[28px] mb-7 shadow-[0_8px_20px_rgba(246,205,40,0.2)] transition-transform duration-300 group-hover:scale-112 group-hover:rotate-5">📸</div>
                                <h3 className="text-[22px] font-extrabold mb-3 leading-snug tracking-tight">Shot by people, not prompts.</h3>
                                <p className="text-base text-[#555555] leading-relaxed font-normal">Every listing is photographed by a professional photographer or our in-house team. We turn up. We see the space. We shoot it as it is.</p>
                            </div>
                            <div className="bg-white/60 backdrop-blur-[10px] border-[1.5px] border-[#111111]/15 rounded-[24px] px-8 py-10 transition-all duration-350 ease-[cubic-bezier(0.23,1,0.32,1)] relative overflow-hidden hover:border-[#111111] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] group animate-fade-in-up [animation-delay:300ms]">
                                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />
                                <div className="w-16 h-16 bg-gradient-to-br from-[#F6CD28] to-[#f5b800] rounded-[18px] flex items-center justify-center text-[28px] mb-7 shadow-[0_8px_20px_rgba(246,205,40,0.2)] transition-transform duration-300 group-hover:scale-112 group-hover:rotate-5">✓</div>
                                <h3 className="text-[22px] font-extrabold mb-3 leading-snug tracking-tight">Verified before going live.</h3>
                                <p className="text-base text-[#555555] leading-relaxed font-normal">Every space is visited in person before it&apos;s listed. If the photos don&apos;t match what&apos;s on the ground, the listing doesn&apos;t go up.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* WHY */}
                <section className="py-[70px] md:py-[100px] border-b border-[#111111]/10 bg-gradient-to-b from-[#FAFAF7] to-white">
                    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-[100px] items-start">
                            <div className="mb-0 max-w-[720px] animate-fade-in-up">
                                <h2 className="text-[clamp(32px,4vw,44px)] leading-tight tracking-[-0.025em] font-extrabold mb-5">Why we&apos;re making a policy out of this.</h2>
                                <p className="text-lg text-[#555555] leading-relaxed font-normal">Short answer: the marketplace trust problem is real, and we&apos;re not interested in being part of it.</p>
                            </div>
                            <div className="text-lg leading-relaxed text-[#111111] animate-fade-in-up [animation-delay:200ms] space-y-6">
                                <p>You&apos;ve probably seen it before — show up to a venue and it looks nothing like the listing. Stock photos used as real ones. Spaces that don&apos;t exist. AI image tools have made this worse, not better.</p>
                                <p>We refuse to play that game. The photos on Spare Space look good because the <strong className="font-bold text-[#111111]">spaces</strong> are good — not because we faked them. A good photographer, the right lens, the right light: any real space can look incredible. That&apos;s the whole job.</p>
                                <p>This page exists so you know that. And so we have something to point to when we say it.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-[70px] md:py-[100px] border-b border-[#111111]/10 bg-white">
                    <div className="max-w-[1180px] mx-auto px-5 md:px-8">
                        <div className="mb-16 max-w-[720px] animate-fade-in-up">
                            <h2 className="text-[clamp(32px,4vw,44px)] leading-tight tracking-[-0.025em] font-extrabold mb-5">Fair questions, answered.</h2>
                            <p className="text-lg text-[#555555] leading-relaxed font-normal">Everything we get asked about how this works in practice.</p>
                        </div>
                        <div className="max-w-[880px] w-full">
                            <div className="border-t border-[#111111]/10 py-7 md:py-9 grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3 md:gap-10 items-start animate-fade-in-up last:border-b last:border-[#111111]/10 [animation-delay:100ms]">
                                <div className="text-[19px] font-extrabold leading-snug tracking-tight text-[#111111]">But these photos honestly look unreal.</div>
                                <div className="text-[17px] text-[#555555] leading-relaxed font-normal">We know - that&apos;s the whole reason this page exists. A good photographer with the right gear can make a real space look like a render. That doesn&apos;t make it one.</div>
                            </div>

                            <div className="border-t border-[#111111]/10 py-7 md:py-9 grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3 md:gap-10 items-start animate-fade-in-up last:border-b last:border-[#111111]/10 [animation-delay:200ms]">
                                <div className="text-[19px] font-extrabold leading-snug tracking-tight text-[#111111]">What counts as a &quot;mismatch&quot;?</div>
                                <div className="text-[17px] text-[#555555] leading-relaxed font-normal">Layout, key features, cleanliness, and equipment listed in the description. If something material is different from the photos or the listing, that&apos;s a mismatch - flag it on WhatsApp and we&apos;ll sort it.</div>
                            </div>

                            <div className="border-t border-[#111111]/10 py-7 md:py-9 grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3 md:gap-10 items-start animate-fade-in-up last:border-b last:border-[#111111]/10 [animation-delay:300ms]">
                                <div className="text-[19px] font-extrabold leading-snug tracking-tight text-[#111111]">Do you ever edit the photos at all?</div>
                                <div className="text-[17px] text-[#555555] leading-relaxed font-normal">Basic colour correction and cropping, yes - same as any photographer. No removing furniture, no adding decor, no AI cleanup, no compositing.</div>
                            </div>

                            <div className="border-t border-[#111111]/10 py-7 md:py-9 grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-3 md:gap-10 items-start animate-fade-in-up last:border-b last:border-[#111111]/10 [animation-delay:400ms]">
                                <div className="text-[19px] font-extrabold leading-snug tracking-tight text-[#111111]">What if a host updates their space after the shoot?</div>
                                <div className="text-[17px] text-[#555555] leading-relaxed font-normal">Hosts tell us, we reshoot, the listing updates. If a host changes the space without telling us, the listing comes down until we re-verify it - we don&apos;t let stale listings stay live.</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="text-center bg-white py-[100px] md:py-[140px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_rgba(255,255,255,0.1)_0%,_transparent_50%),_radial-gradient(circle_at_80%_80%,_rgba(0,0,0,0.05)_0%,_transparent_50%)] pointer-events-none" />
                    <div className="max-w-[1180px] mx-auto px-5 md:px-8 relative z-1">
                        <h2 className="text-[clamp(40px,5.5vw,64px)] leading-[1.05] tracking-[-0.03em] font-extrabold mb-5 animate-fade-in-up [animation-delay:100ms]">Real spaces.<br />Booked by the hour.</h2>
                        <p className="text-lg text-black/65 leading-relaxed font-normal mb-11 animate-fade-in-up [animation-delay:200ms]">Browse studios, workshops, and event spaces across Delhi NCR.</p>
                        <Link href="/space-list" className="inline-flex items-center gap-3 px-10 py-5 bg-[#F6CD28] hover:bg-[#e5be21] text-[#111111] rounded-full font-bold text-lg transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_12px_30px_rgba(246,205,40,0.25)] hover:shadow-[0_20px_40px_rgba(246,205,40,0.35)] hover:-translate-y-1 active:-translate-y-0.5 animate-fade-in-up [animation-delay:300ms] cursor-pointer">
                            <span>Browse spaces</span>
                        </Link>
                    </div>
                </section>

                </div>

                <Footer />
            </div>
        </>
    );
}