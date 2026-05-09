import { Metadata } from 'next';
import { headers } from 'next/headers';
import { Header } from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import HostOnSpareSpaceSection from '@/components/landing/HostOnSpareSpaceSection';

export async function generateMetadata(): Promise<Metadata> {
    const headersList = await headers();
    const host = headersList.get("host");

    const protocol = host?.includes("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}`;

    return {
        title: 'List Your Space | Spare Space',
        description:
            'Host your space on Spare Space and start earning. Monetize unused time slots and get discovered by creators across India.',
        openGraph: {
            title: 'List Your Space | Spare Space',
            description: 'Host your space on Spare Space and start earning. Monetize unused time slots and get discovered by creators across India.',
            url: baseUrl,
            siteName: "Spare Space",
            images: [
                {
                    url: `${baseUrl}/list-your-space.png`,
                    width: 1200,
                    height: 630,
                    alt: "Spare Space",
                },
            ],
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: 'List Your Space | Spare Space',
            description: 'Host your space on Spare Space and start earning. Monetize unused time slots and get discovered by creators across India.',
            images: [`${baseUrl}/list-your-space.png`],
        },
    };
}

const ListYourSpacePage = () => {
    return (
        <main className="min-h-screen">
            <Header />
            <HostOnSpareSpaceSection />
            <Footer />
        </main>
    );
};

export default ListYourSpacePage;
