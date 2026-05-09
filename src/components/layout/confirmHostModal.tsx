import React from 'react';
import { Modal } from '../ui/modal';
import { TriangleAlert } from 'lucide-react';
import { Button } from '../ui/button';

const ConfirmHostModal = ({ open, onClose, onConfirm }) => {
    return (
        <Modal showClose={false} className="" open={open} onClose={onClose}>
            <div className="flex max-w-80 h-fit flex-col gap-8 items-center">
                <div className="flex items-center flex-col gap-2">
                    <TriangleAlert className="mx-auto h-20 w-20 text-[#F6CD28]" />
                    <div className="self-stretch text-center justify-start text-gray-900 text-2xl font-semibold font-['Figtree'] leading-loose">
                        Switch Profile?
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="self-stretch text-center justify-start">
                        <span className="text-zinc-800 text-xl font-semibold font-['Figtree'] leading-tight">
                            You{"'"}re about to switch to{' '}
                        </span>
                        <span className="text-[#F6CD28] text-xl font-semibold font-['Figtree'] leading-tight">
                            Host Mode
                        </span>
                        <span className="text-zinc-800 text-xl font-semibold font-['Figtree'] leading-tight">
                            . This will change how you use the platform.
                        </span>
                    </div>
                    <div className="self-stretch text-center justify-start text-black text-base font-normal font-['Figtree']">
                        Are you sure you want to continue?
                    </div>
                </div>
                <div className="flex w-full gap-4 flex-col">
                    <Button onClick={onConfirm}>Confirm</Button>
                    <Button variant="outline" onClick={() => onClose(false)}>
                        Cancel
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmHostModal;
