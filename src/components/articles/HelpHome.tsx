import React from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HelpIcon from './HelpIcon';

interface HelpCategory {
    title: string;
    icon: string;
    description: string;
    articles?: any[];
}

interface HelpHomeProps {
    sections: Record<string, HelpCategory>;
    onSectionSelect?: (section: string) => void;
}

export default function HelpHome({ sections, onSectionSelect }: HelpHomeProps) {
    function handleSectionClick(sectionKey: string) {
        onSectionSelect(sectionKey);
    }

    function renderSectionCard([key, section]: [string, HelpCategory]) {
        return (
            <Link key={key} href={`/articles/${key}`} className="block h-auto">
                <Button
                    variant="ghost"
                    className="bg-white rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left border-t-4 border-yellow-400 h-full flex flex-col items-start w-full"
                >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-yellow-100">
                        <HelpIcon name={section.icon} size={24} className="text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">{section.title}</h2>
                    <p className="mb-4 text-gray-600 line-clamp-3">{section.description}</p>
                </Button>
            </Link>
        );
    }

    return (
        <div className=" bg-white">
            <div className="bg-gradient-to-br from-[#FEFAEE] via-white to-[#FDF8E4] py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-6 text-gray-900">How can we help?</h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 -mt-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries(sections).map(renderSectionCard)}
                </div>
            </div>
        </div>
    );
}
