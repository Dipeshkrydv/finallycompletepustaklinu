'use client';

import { useEffect, useState } from 'react';

export default function Template({ children }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className={`${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            {children}
        </div>
    );
}
