interface PersonProps {
    name: string;
    avatarUrl?: string;
}

interface TestimonialProps {
    testimonial: string;
    icon?: React.ReactNode;
}

interface TestimonialCarouselProps {
    testimonials: TestimonialCardProps[];
    loading?: boolean;
}

interface TestimonialAvatarProps extends PersonProps {
    AvatarComponent?: React.ElementType;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    fallbackClassName?: string;
}

interface RoleProps {
    name?: string;
    role?: string;
    organizationName?: string;
    organizationAvatarUrl?: string;
}

interface TestimonialCardProps {
    name: string;
    avatarUrl?: any;
    testimonial: string;
    role?: string;
    roleAvatarUrl?: string;
    className?: string;
    organizationName?: string;
    organizationAvatarUrl?: any;
}

export type {
    PersonProps,
    TestimonialProps,
    TestimonialCardProps,
    TestimonialCarouselProps,
    TestimonialAvatarProps,
    RoleProps,
};
