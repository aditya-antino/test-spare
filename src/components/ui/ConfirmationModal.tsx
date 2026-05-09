'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    isLoading?: boolean;
    disableConfirm?: boolean;
    disableCancel?: boolean;
}

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    isLoading = false,
    disableConfirm = false,
    disableCancel = false,
}: ConfirmationModalProps) => {
    const handleConfirm = () => {
        if (!isLoading && !disableConfirm) {
            onConfirm();
        }
    };

    const handleClose = () => {
        if (!isLoading && !disableCancel) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                            </div>
                        )}
                        <DialogTitle className={variant === 'destructive' ? 'text-red-600' : ''}>
                            {title}
                        </DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row gap-3 sm:justify-end">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading || disableCancel}
                        className="flex-1 sm:flex-none"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={isLoading || disableConfirm}
                        className="flex-1 sm:flex-none"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            confirmText
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationModal;
