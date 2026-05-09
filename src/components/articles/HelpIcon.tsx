import React from 'react';
import { User, Users, LucideProps } from 'lucide-react';

const icons = {
    User,
    Users,
};

export type IconName = keyof typeof icons;

interface HelpIconProps extends LucideProps {
    name: IconName | string;
}

export default function HelpIcon({ name, ...props }: HelpIconProps) {
    const IconComponent = icons[name as IconName] || Users;
    return <IconComponent {...props} />;
}
