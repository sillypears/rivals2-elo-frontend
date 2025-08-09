let socket;
const listeners = new Set();

export function connectWebSocket(url) {
    if (socket) {
        console.log(`Already connected to: ${socket.url}`)
        return socket;
    }
    socket = new WebSocket(url);

    socket.onmessage = (event) => {
        if (event.data === "ping") {
            socket.send("pong");
            return;
        }
        try {
            const data = JSON.parse(event.data);
            if (!event.data || event.data.trim().charAt(0) !== '{') return;
            for (const listener of listeners) {
                listener(data);
            }
        } catch (err) {
            console.warn("WS parse error:", err);
        }
    };

    socket.onopen = () => console.log("WebSocket connected");
    socket.onclose = () => console.log("WebSocket closed");
    socket.onerror = (err) => console.error("WebSocket error", err);

    return socket;
}

export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
