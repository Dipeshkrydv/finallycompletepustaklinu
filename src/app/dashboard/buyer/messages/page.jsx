
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User as UserIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BuyerMessages() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(searchParams.get('initialMessage') || '');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchMessages();
        // Simple polling for new messages (every 5 seconds)
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(); // Refresh immediately
            }
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-100px)] flex flex-col">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-amber-50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center text-amber-800">
                        <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">Support Chat</h2>
                        <p className="text-xs text-gray-500">Ask the Admin anything</p>
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {loading ? (
                        <div className="text-center text-gray-400 py-10">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-400 py-10">No messages yet. Say hello!</div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.senderId === session?.user?.id;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${isMe
                                                ? 'bg-amber-600 text-white rounded-br-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <span className={`text-[10px] block mt-1 ${isMe ? 'text-amber-200' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
