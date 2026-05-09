import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Info } from 'lucide-react';
import React from 'react';

interface BlockTimeSlotDeleteModalProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
}

const BlockTimeSlotDeleteModal: React.FC<BlockTimeSlotDeleteModalProps> = ({
    open,
    onClose,
    onDelete,
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col items-center gap-3">
                    <Info className="text-red-500 w-10 h-10" />
                    <span className="text-base font-medium">
                        Are you sure you want to delete this blocked slot?
                    </span>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={onDelete}>
                        Delete
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default BlockTimeSlotDeleteModal;
