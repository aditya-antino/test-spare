export interface BannerContent {
    title: string;
    description: string;
    keywords?: string;
    ogImage?: string;
    parentCategory?: string;
}

export const CATEGORY_BANNERS: Record<string, BannerContent> = {
    // Categories
    'residential-spaces': {
        title: 'Residential Spaces',
        description: 'Discover stunning apartments, homes, and luxury villas for shoots. Perfect for creative projects, lifestyle photography, and content creation. Book authentic residential locations with unique character.',
        keywords: 'Home photoshoot, villa rental, apartment venue',
        ogImage: '/og-images/residential-spaces.png'
    },
    'event-spaces': {
        title: 'Event Spaces',
        description: 'Find the perfect venue for product launches, networking events, and brand activations. Flexible event spaces with professional setups, catering options, and full technical support.',
        keywords: 'Event venue rental, product launch space',
        ogImage: '/og-images/event-spaces.png'
    },
    'work-meeting-spaces': {
        title: 'Work & Meeting Spaces',
        description: 'Professional meeting rooms for workshops, team collaboration, and business meetings. Equipped with high-speed internet, AV systems, and breakout areas for productive sessions.',
        keywords: 'Meeting room rental, office space for meetings',
        ogImage: '/og-images/work-meeting-spaces.png'
    },
    'creative-spaces': {
        title: 'Creative Spaces',
        description: 'Inspiring studios and creative hubs for artists, designers, and innovators. Bring your ideas to life with professional art studios, design workspaces, and collaborative creative environments.',
        keywords: 'Artist studio space, creative workspace',
        ogImage: '/og-images/creative-spaces.png'
    },
    'dining-spaces': {
        title: 'Dining Spaces',
        description: 'Beautifully designed culinary spaces for cooking classes, dinner parties, and food photography. Fully equipped kitchens, elegant dining areas, and atmospheric settings for food events.',
        keywords: 'Cooking class venue, dinner party space',
        ogImage: '/og-images/dining-spaces.png'
    },
    'outdoor-spaces': {
        title: 'Outdoor Spaces',
        description: 'Breathtaking open-air venues for garden parties, outdoor shoots, and team retreats. Natural backdrops with landscaping, terraces, and refreshing environments for outdoor events.',
        keywords: 'Outdoor event venue, garden party space',
        ogImage: '/og-images/outdoor-spaces.png'
    },

    // Activities
    'interviews': {
        title: 'Interview Spaces',
        description: 'Quiet, acoustically-treated rooms perfect for capturing high-quality interviews and testimonials. Professional-grade equipment, minimal distractions, and ideal lighting for video content.',
        keywords: 'Interview room rental, testimonial video space',
        parentCategory: 'work-meeting-spaces'
    },
    'screening': {
        title: 'Screening Rooms',
        description: 'Private theaters and viewing rooms for film screenings, presentations, and media reviews. Professional projection, premium seating, and controlled sound systems.',
        keywords: 'Screening room rental, private theater',
        parentCategory: 'creative-spaces'
    },
    'events': {
        title: 'Event Venues',
        description: 'Versatile spaces for corporate conferences, creative pop-ups, and special celebrations. Customizable layouts, modern facilities, and support for events of all sizes and themes.',
        keywords: 'Corporate event venue, conference space',
        parentCategory: 'event-spaces'
    },
    'cooking-class': {
        title: 'Kitchen & Cooking Spaces',
        description: 'Fully-equipped commercial kitchens and dining areas for interactive cooking classes and culinary workshops. Professional-grade appliances, prep stations, and beautiful dining setups.',
        keywords: 'Cooking class venue, commercial kitchen rental',
        parentCategory: 'dining-spaces'
    },
    'sound-stage': {
        title: 'Sound Stages',
        description: 'Professional acoustic environments for film productions and high-fidelity audio recordings. Soundproofed stages, technical infrastructure, and production-ready facilities.',
        keywords: 'Sound stage rental, film production studio',
        parentCategory: 'creative-spaces'
    },
    'filming': {
        title: 'Filming Locations',
        description: 'Wide range of cinematic backdrops and locations for films, commercials, and professional video production. Diverse settings with production support and location management services.',
        keywords: 'Film location rental, commercial shoot location',
        parentCategory: 'creative-spaces'
    },
    'exhibition': {
        title: 'Exhibition Galleries',
        description: 'Spacious, well-lit venues to showcase art, products, and creative installations. Professional gallery spaces with display systems, lighting, and curatorial support.',
        keywords: 'Gallery space rental, art exhibition venue',
        parentCategory: 'creative-spaces'
    },
    'press-event': {
        title: 'Press & Media Venues',
        description: 'Professional spaces designed for press conferences, media announcements, and product reveals. Media-friendly setups with press kits, signage, and broadcast-ready facilities.',
        keywords: 'Press conference venue, media event space',
        parentCategory: 'event-spaces'
    },
    'networking-event': {
        title: 'Networking Spaces',
        description: 'Conducive environments for professional networking, sharing ideas, and building meaningful business connections. Open layouts, bar areas, and social zones for easy mingling.',
        keywords: 'Networking event venue, mixer space',
        parentCategory: 'work-meeting-spaces'
    },
    'wine-tasting': {
        title: 'Wine Tasting Rooms',
        description: 'Elegant and intimate settings for sophisticated wine tastings and curated food-pairing events. Climate-controlled rooms with sommelier support and premium service setups.',
        keywords: 'Wine tasting venue, wine tasting room rental',
        parentCategory: 'dining-spaces'
    },
    'video-shoot': {
        title: 'Video Production Spaces',
        description: 'Versatile locations optimized for video shoots, music videos, and commercial content creation. Professional lighting, backdrop options, and production-ready infrastructure.',
        keywords: 'Video production studio, music video location',
        parentCategory: 'creative-spaces'
    },
    'photography': {
        title: 'Photography Studios',
        description: 'Natural light studios and professional setups for fashion, product, and portrait photography. Cycloramas, studio equipment, and styling areas for polished photo sessions.',
        keywords: 'Photography studio rental, professional photo studio',
        parentCategory: 'creative-spaces'
    },
    'fitness-class': {
        title: 'Fitness & Yoga Studios',
        description: 'Energizing spaces for workouts, wellness workshops, and community fitness classes. Equipped studios with mirrors, sound systems, and flexible layouts for various fitness activities.',
        keywords: 'Yoga studio rental, fitness class venue',
        parentCategory: 'event-spaces'
    },
    'influencer-shoot': {
        title: 'Influencer Friendly Spaces',
        description: 'High-aesthetic, Instagrammable locations designed specifically for content creators and social media shoots. Photogenic backdrops, professional lighting, and influencer-optimized setups.',
        keywords: 'Instagram location, content creator space',
        parentCategory: 'creative-spaces'
    },
    'team-building': {
        title: 'Team Building Venues',
        description: 'Engaging environments for team retreats, collaborative games, and bonding activities. Multi-functional spaces with breakout areas, activity zones, and hospitality services.',
        keywords: 'Team building venue, corporate retreat space',
        parentCategory: 'work-meeting-spaces'
    },
    'photo-shoot': {
        title: 'Photoshoot Locations',
        description: 'Curated selection of the most photogenic spaces for professional photography campaigns. Diverse backdrops, scenic locations, and location management for shoots.',
        keywords: 'Photoshoot location, photo location rental',
        parentCategory: 'creative-spaces'
    },
    'meetup': {
        title: 'Meetup Spaces',
        description: 'Community-focused venues for hobbyist groups, tech meetups, and local gatherings. Accessible spaces with seating, AV equipment, and community-friendly atmospheres.',
        keywords: 'Meetup venue, community space rental',
        parentCategory: 'work-meeting-spaces'
    },
    'podcast': {
        title: 'Podcast Studios',
        description: 'Acoustically treated rooms with professional vibes for podcast recordings and audio production. Soundproofed studios, mixing equipment, and podcast-optimized setups.',
        keywords: 'Podcast studio rental, recording studio',
        parentCategory: 'creative-spaces'
    },
    'group-work': {
        title: 'Collaborative Workspaces',
        description: 'Shared environments for team projects, brainstorming sessions, and collaborative co-working. Open layouts with break areas, high-speed connectivity, and flexible furniture.',
        keywords: 'Co-working space, collaborative workspace',
        parentCategory: 'work-meeting-spaces'
    },
    'off-site-meetings': {
        title: 'Off-site Meeting Rooms',
        description: 'Inspiring off-site locations away from the office to refresh your team\'s perspective. Change-of-scenery meeting spaces with catering, activity areas, and relaxation zones.',
        keywords: 'Off-site meeting venue, corporate retreat space',
        parentCategory: 'work-meeting-spaces'
    },
    'music-video': {
        title: 'Music Video Sets',
        description: 'Visual-rich locations to give your music videos unique and professional aesthetics. Cinematic backdrops, production support, and location flexibility for creative music content.',
        keywords: 'Music video location, music video set',
        parentCategory: 'creative-spaces'
    },
    'production-meeting': {
        title: 'Production Offices',
        description: 'Efficient and professional rooms for pre-production planning and logistics management. Organized workspaces, equipment storage, and production-ready infrastructure.',
        keywords: 'Production office, office space rental',
        parentCategory: 'creative-spaces'
    },
    'launch-event': {
        title: 'Product Launch Venues',
        description: 'Statement-making spaces that reflect your brand\'s vision and excitement for product launches. Premium venues with staging, AV capabilities, and media-ready setups.',
        keywords: 'Product launch venue, launch event space',
        parentCategory: 'event-spaces'
    },
    'performance': {
        title: 'Performance Spaces',
        description: 'Professional stages and intimate venues for live music, theater, and artistic performances. Sound-ready stages, lighting systems, and audience-friendly configurations.',
        keywords: 'Performance venue, theater stage rental',
        parentCategory: 'creative-spaces'
    },
    'auditions': {
        title: 'Audition Rooms',
        description: 'Welcoming and functional spaces for casting calls, talent auditions, and performance evaluations. Professional yet comfortable settings with breakout areas for interviews.',
        keywords: 'Audition room rental, casting space',
        parentCategory: 'creative-spaces'
    },
    'music-show': {
        title: 'Live Music Venues',
        description: 'Find the perfect stage for concerts, gigs, and musical showcases with professional sound. Equipped venues with stage systems, audience capacity, and full technical support.',
        keywords: 'Live music venue, concert venue',
        parentCategory: 'event-spaces'
    },
    'rehearsals': {
        title: 'Rehearsal Studios',
        description: 'Dedicated spaces for musicians, dancers, and actors to practice and perfect their craft. Acoustically suited studios with mirrors, sound systems, and equipment storage.',
        keywords: 'Rehearsal studio, practice space',
        parentCategory: 'creative-spaces'
    },
    'mixer': {
        title: 'Mixer & Social Venues',
        description: 'Casual yet chic spaces for social gatherings, corporate mixers, and after-hours networking events. Trendy ambiance, bar areas, and comfortable lounge setups.',
        keywords: 'Mixer venue, social event space',
        parentCategory: 'event-spaces'
    },
    'meeting': {
        title: 'Meeting Rooms',
        description: 'Reliable, well-equipped spaces designed for your day-to-day business and executive meetings. Professional environments with conference tables, whiteboards, and connectivity.',
        keywords: 'Meeting room rental, conference room',
        parentCategory: 'work-meeting-spaces'
    },
    'videography': {
        title: 'Videography Locations',
        description: 'Diverse settings to capture compelling visual stories and commercial footage. Multiple location types within single venues for varied production needs.',
        keywords: 'Videography location, video location rental',
        parentCategory: 'creative-spaces'
    },
    'celebration': {
        title: 'Celebration Venues',
        description: 'Host your birthday, anniversary, or special achievement in a space that feels truly memorable. Festive-ready venues with decoration options, catering, and entertainment support.',
        keywords: 'Birthday venue, celebration space',
        parentCategory: 'event-spaces'
    },
    'product-launches': {
        title: 'Product Launch Spaces',
        description: 'Creative environments to introduce your latest innovations to the world in style. Showcase-ready venues with exhibition setup, press accommodations, and brand alignment.',
        keywords: 'Product launch space, innovation venue',
        parentCategory: 'event-spaces'
    },
    'small-gatherings': {
        title: 'Intimate Gathering Spaces',
        description: 'Cozy and private venues perfect for small group meetings and personal celebrations. Exclusive spaces with personalized service, flexible layouts, and privacy.',
        keywords: 'Private event space, intimate gathering venue',
        parentCategory: 'event-spaces'
    },
    'poetry-reading': {
        title: 'Poetry & Spoken Word Venues',
        description: 'Intimate and atmospheric spaces for literary events, poetry readings, and artistic expression. Aesthetic venues with ambient lighting and intimate audience setups.',
        keywords: 'Poetry reading venue, literary event space',
        parentCategory: 'creative-spaces'
    },
    'art-exhibit': {
        title: 'Art Exhibition Spaces',
        description: 'Gallery-style venues to display and celebrate fine art, sculpture, and installations. Professional gallery settings with track lighting, climate control, and artistic ambiance.',
        keywords: 'Art gallery space, exhibition venue',
        parentCategory: 'creative-spaces'
    },
    'theatre': {
        title: 'Theatre & Drama Venues',
        description: 'Professional stages and performing arts spaces for theatrical productions and drama workshops. Well-equipped theaters with seating, lighting rigs, and backstage facilities.',
        keywords: 'Theater rental, drama venue',
        parentCategory: 'creative-spaces'
    },
    'photography-exhibit': {
        title: 'Photography Galleries',
        description: 'Clean, professional spaces specifically curated for showcasing photographic art. Gallery-quality lighting, wall systems, and elegant presentation environments.',
        keywords: 'Photography gallery, photo exhibition space',
        parentCategory: 'creative-spaces'
    },
    'outdoor-event': {
        title: 'Outdoor Event Venues',
        description: 'Refreshing open-air locations for festivals, outdoor weddings, and corporate picnics. Natural settings with amenities, shade structures, and event support.',
        keywords: 'Outdoor event venue, garden wedding space',
        parentCategory: 'outdoor-spaces'
    },
    'wellness': {
        title: 'Wellness & Healing Spaces',
        description: 'Tranquil environments designed for meditation, yoga retreats, and holistic wellness events. Serene atmospheres with spa facilities, nature elements, and mindfulness setup.',
        keywords: 'Yoga retreat venue, wellness space',
        parentCategory: 'creative-spaces'
    },
    'workshop': {
        title: 'Workshop Studios',
        description: 'Functional and inspiring spaces for teaching, learning, and collaborative creation. Equipped studios with workstations, demonstration areas, and interactive learning setups.',
        keywords: 'Workshop venue, training space',
        parentCategory: 'work-meeting-spaces'
    },
};

export const DEFAULT_BANNER: BannerContent = {
    title: 'Discover Unique Spaces',
    description: 'Explore a curated collection of spaces for meetings, events, and creative projects in your city.',
};
