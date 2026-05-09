import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Tab {
    label: string;
    value: string;
    showBadge?: boolean;
    tooltip?: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabValue: string) => void;
    variant?: 'underline' | 'pill' | 'outline' | 'ghost';
    className?: string;
    activeClass?: string;
    inActiveClass?: string;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    variant = 'underline',
    className,
    activeClass,
    inActiveClass,
}) => {
    const baseClasses = 'flex gap-4 py-1 max-w-screen overflow-x-auto px-2';

    const variantClasses = {
        underline: 'border-gray-300',
        pill: 'gap-2',
        outline: 'gap-6',
        ghost: 'gap-4',
    };

    const tabBaseClasses =
        'relative py-2 text-nowrap px-4 text-base font-medium transition-colors cursor-pointer';

    const tabVariantClasses = {
        underline: {
            active: `text-black border-b-2 border-[#F6CD28] ${activeClass}`,
            inactive: `text-gray-400 hover:text-black ${inActiveClass}`,
        },
        pill: {
            active: `bg-[#f6cd28] text-black rounded-full font-semibold shadow-sm ${activeClass}`,
            inactive: `text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full ${inActiveClass}`,
        },
        outline: {
            active: `border-2 border-[#F6CD28] text-black font-semibold bg-white rounded-full shadow-none cursor-pointer ${activeClass}`,
            inactive: `text-gray-400 font-medium bg-transparent rounded-full border-2 border-transparent cursor-pointer ${inActiveClass}`,
        },
        ghost: {
            active: `text-zinc-800 text-sm font-medium bg-gray-100 cursor-pointer rounded-full ${activeClass}`,
            inactive: `text-gray-600 text-sm bg-transparent rounded-full cursor-pointer ${inActiveClass}`,
        },
    };

    return (
        <Tooltip.Provider delayDuration={200}>
            <div className={cn(baseClasses, variantClasses[variant], className)}>
                {tabs.map((tab) => {
                    const tabButton = (
                        <button
                            key={tab.value}
                            className={cn(
                                tabBaseClasses,
                                activeTab === tab.value
                                    ? tabVariantClasses[variant].active
                                    : tabVariantClasses[variant].inactive,
                            )}
                            onClick={() => onTabChange(tab.value)}
                        >
                            <span>{tab.label}</span>

                            {tab.showBadge && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    );

                    if (tab.tooltip) {
                        return (
                            <Tooltip.Root key={tab.value}>
                                <Tooltip.Trigger asChild>{tabButton}</Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="bg-zinc-900 text-white text-sm px-3 py-2 rounded-md shadow-lg max-w-xs break-words z-50"
                                        sideOffset={6}
                                    >
                                        <div className="whitespace-pre-line">{tab.tooltip}</div>
                                        <Tooltip.Arrow className="fill-zinc-900" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        );
                    }

                    return tabButton;
                })}
            </div>
        </Tooltip.Provider>
    );
};
