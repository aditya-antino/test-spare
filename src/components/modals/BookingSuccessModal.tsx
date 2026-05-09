'use client'

import React from 'react'
import { X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
}

const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  isOpen,
  onClose,
  title,
  message
}) => {
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute w-full inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#F6CD28] rounded-full flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Button
            onClick={onClose}
            className="bg-[#F6CD28] hover:bg-yellow-500 text-black font-semibold px-8 py-2 rounded-full"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BookingSuccessModal