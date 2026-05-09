import { TestimonialAvatarProps, TestimonialCardProps } from '@/types';
import { RoleProps } from '@/types/@types.testimonial';
import { Quote } from 'lucide-react';
import Image from 'next/image';

const TestimonialAvatar = ({ name, avatarUrl }: TestimonialAvatarProps) => {
    if (!avatarUrl) return null;

    return (
        <Image
            src={avatarUrl}
            alt={name || 'avatar'}
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0"
        />
    );
};

const PersonAvatar = ({ name, avatarUrl, className = '' }: TestimonialAvatarProps) => {
    if (!name && !avatarUrl) return null;

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <TestimonialAvatar name={name} avatarUrl={avatarUrl} />
            {name && <span className="font-semibold text-gray-900">{name}</span>}
        </div>
    );
};

const RoleBadge = ({ name, role, organizationName, organizationAvatarUrl }: RoleProps) => {
    if (!name && !role) return null;

    return (
        <div className="flex flex-col">
            {(role || organizationName) && (
                <div className="flex flex-row items-center justify-center gap-2">
                    {organizationAvatarUrl && (
                        <div>
                            <TestimonialAvatar name={name} avatarUrl={organizationAvatarUrl} />
                        </div>
                    )}
                    <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex flex-row">
                            {role && <span>{role}</span>}
                            {role && organizationName && <span>, </span>}
                        </div>
                        {organizationName && <span>{organizationName}</span>}
                    </div>
                </div>
            )}
        </div>
    );
};

const TestimonialCard = ({
    name,
    avatarUrl,
    testimonial,
    role,
    organizationName,
    organizationAvatarUrl,
    className = '',
}: TestimonialCardProps) => {
    return (
        <div className={`bg-white rounded-xl p-6 flex flex-col relative h-full ${className}`}>
            <div className="absolute top-4 left-6 text-[#F6CD28]">
                <Quote className="w-12 h-12 transform -scale-x-100 -scale-y-100" />
            </div>

            <div className="flex justify-end mb-2">
                <PersonAvatar name={name} avatarUrl={avatarUrl} />
            </div>

            <p className="text-gray-800 leading-relaxed mt-8 mb-4 flex-grow">{testimonial}</p>

            <div className="flex items-center gap-3 mt-auto">
                <RoleBadge
                    name={name}
                    role={role}
                    organizationName={organizationName}
                    organizationAvatarUrl={organizationAvatarUrl}
                />
            </div>
        </div>
    );
};

export default TestimonialCard;
