import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/modal';
import { CheckCircle2 } from 'lucide-react';
import Typography from '../ui/typoGraphy';

const ConguratulationsModal = () => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      showClose={false}
      className="sm:max-w-96 text-center rounded-2xl p-8 bg-white shadow-xl relative"
      ariaLabel="Listing Success Modal"
      closeOnOverlay={false}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <CheckCircle2
            className="w-16 h-16 text-yellow-500 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] animate-bounce-slow"
            strokeWidth={2.5}
          />
        </div>

        <Typography variant="h5" className="font-semibold text-gray-900">
          Listing uploaded successfully 🎉
        </Typography>

        <Typography variant="body2" className="text-gray-600 leading-relaxed">
          Your space has been uploaded and sent for review. You’ll be notified once it’s approved
          and goes live.
        </Typography>
      </div>
    </Modal>
  );
};

export default ConguratulationsModal;
