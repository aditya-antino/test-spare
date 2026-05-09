'use client';
import React from 'react';
import { MapPin } from 'lucide-react';
import PlacesSearchMap from '../../app/(afterAuth)/host/space/your-listings/list-space/[[...slug]]/step5map';

interface ShowMapCTAProps {
    onClick?: () => void;
    className?: string;
}

const ShowMapCTA = ({ onClick, className = '' }: ShowMapCTAProps) => {
    return (
        <div className={`w-full ${className}`}>
            {/* Show Map CTA Button - Only for mobile */}
            <div className="md:hidden px-4 py-3 flex items-center justify-center">
                <button
                    onClick={onClick}
                    className="bg-[#F7CD29] text-gray-800 font-medium py-3 px-6 rounded-full shadow-sm hover:bg-[#e6b908] transition-colors flex items-center gap-2 w-full max-w-sm justify-center"
                >
                    <MapPin className="h-4 w-4" />
                    Show Map
                </button>
            </div>
        </div>
    );
};

export default ShowMapCTA;
