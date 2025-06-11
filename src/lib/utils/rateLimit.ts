const RATE_LIMIT = {
    WINDOW_MS: 60 * 1000, // 1 minuut
    MAX_REQUESTS: 10 // maximaal 10 requests per minuut
};

const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const requestData = requestCounts.get(ip);

    if (!requestData) {
        requestCounts.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (now - requestData.timestamp > RATE_LIMIT.WINDOW_MS) {
        // Reset als window voorbij is
        requestCounts.set(ip, { count: 1, timestamp: now });
        return true;
    }

    if (requestData.count >= RATE_LIMIT.MAX_REQUESTS) {
        return false;
    }

    requestData.count++;
    return true;
} 