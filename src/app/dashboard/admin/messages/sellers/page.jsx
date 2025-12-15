'use client';

import ChatInterface from '@/components/admin/ChatInterface';

export default function SellerMessagesPage() {
    return <ChatInterface roleFilter="seller" title="Seller Chats" />;
}
