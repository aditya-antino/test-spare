'use client';
import { useRef, useEffect, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';

export default function ChatWindow({
    messages,
    onSend,
}: {
    messages: Message[];
    onSend: (msg: string) => void;
}) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (inputValue.trim()) {
            onSend(inputValue);
            setInputValue('');
        }
    };

    return (
        <div className="flex flex-col flex-1">
            {/* Messages */}
            <ScrollArea className="flex-1 p-2">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                ))}
                <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t bg-white flex items-center gap-2">
                <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                />
                <Button
                    onClick={handleSend}
                    className="bg-[#F6CD28] text-white"
                    disabled={!inputValue.trim()}
                >
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}
