'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SellerMessages() {
    const { data: session } = useSession();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');

    // Mock messages for now, as we haven't built the full message API yet
    // In a real app, we'd fetch from /api/messages?chatWith=admin
    const [mockMessages, setMockMessages] = useState([
        { id: 1, sender: 'admin', content: 'Welcome to Pustaklinu! Let us know if you need help selling.', createdAt: new Date().toISOString() }
    ]);

    useEffect(() => {
        // Simulate fetch
        setTimeout(() => {
            setMessages(mockMessages);
            setLoading(false);
        }, 500);
    }, []);

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Optimistic update
        const msg = {
            id: Date.now(),
            sender: 'me',
            content: newMessage,
            createdAt: new Date().toISOString()
        };
        setMessages([...messages, msg]);
        setNewMessage('');
        toast.success('Message sent to Admin');

        // Here we would call POST /api/messages
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-8 flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                        A
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">Admin Support</h2>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-white">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No messages yet.</div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === 'me'
                                    ? 'bg-amber-600 text-white rounded-br-none'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-none'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <span className={`text-[10px] block mt-1 ${msg.sender === 'me' ? 'text-amber-200' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message to admin..."
                            className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-900"
                        />
                        <button
                            type="submit"
                            className="p-3 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
