
'use client';

import { Check, CheckCheck } from 'lucide-react';
import { Message } from '@/types/chat';

function getStatusIcon(status: Message['status']) {
  switch (status) {
    case 'sent':
      return <Check className="w-3 h-3" />;
    case 'delivered':
      return <CheckCheck className="w-3 h-3" />;
    case 'read':
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    default:
      return null;
  }
}

export default function MessageBubble({ msg }: { msg: Message }) {

  return (
    <div
      key={`${msg.id}-${msg.timestamp}`} // ✅ ensures uniqueness
      className={`flex w-full ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          msg.isOwn
            ? 'bg-[#F6CD28] text-black rounded-br-none ml-12'
            : 'bg-gray-100 text-gray-800 rounded-bl-none mr-12'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{msg.text}</p>
        <div
          className={`flex items-center justify-end mt-1 space-x-1 ${
            msg.isOwn ? 'text-yellow-600' : 'text-gray-400'
          }`}
        >
          <span className="text-xs">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
                hour12: true,
            }).toUpperCase()}
          </span>
          {msg.isOwn && getStatusIcon(msg.status)}
        </div>
      </div>
    </div>
  );
}
