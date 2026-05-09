import { Card } from '@/components/ui/card';

export default function SpaceInformation({ description }) {
    return (
        <Card className="p-8 flex flex-col w-full gap-6">
            <h3 className="text-gray-900 text-2xl font-semibold">Space information</h3>
            <div className="border-t w-16" />
            <p className="m-0 p-0 text-gray-600 text-base font-medium break-words whitespace-pre-wrap">
                {description?.trim() || 'No space information available.'}
            </p>
        </Card>
    );
}
