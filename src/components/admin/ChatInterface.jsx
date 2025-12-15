'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ChatInterface({ roleFilter, title }) {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // State
    const [conversations, setConversations] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(searchParams.get('userId') || null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const scrollRef = useRef(null);

    // Initial Load & Polling
    // Initial Load & Polling
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                let data = await res.json();

                // Filter by role if roleFilter is provided
                if (roleFilter) {
                    data = data.filter(c => c.user && c.user.role === roleFilter);
                }

                setConversations(data);
                setLoadingConversations(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMessages = async (userId, showLoading = true) => {
        if (showLoading) setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages?userId=${userId}`);
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (showLoading) setLoadingMessages(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            fetchConversations();
            if (selectedUserId) fetchMessages(selectedUserId, false);
        }, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId, roleFilter]); // Add roleFilter dependency

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUserId) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    receiverId: selectedUserId
                }),
            });

            if (res.ok) {
                setNewMessage('');
                fetchMessages(selectedUserId, false);
            }
        } catch (error) {
            console.error('Failed to send', error);
        }
    };

    const selectUser = (userId) => {
        setSelectedUserId(userId);
        // Preserve current path but update query param
        const currentPath = window.location.pathname;
        router.push(`${currentPath}?userId=${userId}`);
    };

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex">
            {/* Sidebar - Conversations */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-amber-600" /> {title || 'Inbox'}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="p-4 text-center text-gray-500">Loading chats...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No conversations yet.</div>
                    ) : (
                        conversations.map((item) => (
                            <div
                                key={item.user.id}
                                onClick={() => selectUser(item.user.id)}
                                className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition ${selectedUserId == item.user.id ? 'bg-amber-50 border-l-4 border-l-amber-600' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900">{item.user.name}</h3>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-1 truncate">
                                    {item.lastMessage.senderId === session?.user?.id ? 'You: ' : ''}{item.lastMessage.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-gray-50">
                {selectedUserId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                    <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-800">
                                        {conversations.find(c => c.user.id == selectedUserId)?.user.name || 'Chat'}
                                    </h2>
                                    <p className="text-xs text-gray-500">User ID: {selectedUserId}</p>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {loadingMessages ? (
                                <div className="text-center text-gray-400">Loading history...</div>
                            ) : messages.length === 0 ? (
                                <div className="text-center text-gray-400 mt-10">Start the conversation!</div>
                            ) : (
                                messages.map((msg) => {
                                    const isMe = msg.senderId === session?.user?.id;
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-amber-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'}`}>
                                                <p>{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-amber-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
                                placeholder="Type a reply..."
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition disabled:opacity-50 shadow-md flex items-center gap-2 font-bold">
                                <span>Send</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-lg">Select a conversation to view chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
