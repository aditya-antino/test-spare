import * as Tooltip from '@radix-ui/react-tooltip';
import React from 'react';

interface TooltipTextProps {
    text?: string | null;
    maxWidth?: string;
    className?: string;
}

const TooltipText: React.FC<TooltipTextProps> = ({
    text = 'N/A',
    maxWidth = '200px',
    className = '',
}) => {
    if (!text) text = 'N/A';

    return (
        <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <div
                        className={`font-semibold text-zinc-800 text-sm truncate cursor-help ${className}`}
                        style={{ maxWidth }}
                    >
                        {text}
                    </div>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="bg-zinc-900 text-white text-sm px-2 py-1 rounded-md shadow-md max-w-xs break-words"
                        sideOffset={6}
                    >
                        {text}
                        <Tooltip.Arrow className="fill-zinc-900" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </Tooltip.Provider>
    );
};

export default TooltipText;
