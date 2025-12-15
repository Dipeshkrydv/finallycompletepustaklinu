
const rateLimit = new Map();

export default function checkRateLimit(ip, limit = 10, windowMs = 60 * 1000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    const record = rateLimit.get(ip);

    // Cleanup old records potentially (naive cleanup for now, or just restart clears it)
    // For production, use Redis or robust store. This is MVP for single instance.

    if (!record) {
        rateLimit.set(ip, { count: 1, startTime: now });
        return true;
    }

    if (record.startTime < windowStart) {
        // Reset window
        rateLimit.set(ip, { count: 1, startTime: now });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count += 1;
    return true;
}

// Simple cleanup interval (every 10 mins)
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimit.entries()) {
        if (record.startTime < now - 60000) { // 1 min expiry for cleanup check
            rateLimit.delete(ip);
        }
    }
}, 10 * 60 * 1000);
