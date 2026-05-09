import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            // Performance optimizations
            forceNew: false, // Reuse existing connection if available
            upgrade: true, // Allow transport upgrades
            rememberUpgrade: true, // Remember transport preference
            // Reduce ping/pong overhead
            pingTimeout: 60000,
            pingInterval: 25000,
        });

        socket.on('connect', () => {
            // console.log("Socket connected:", socket?.id);
        });

        socket.on('connect_error', (err) => {
            // console.error('Socket connection error:', err.message);
        });

        socket.on('disconnect', (reason) => {
            // console.log('Socket disconnected:', reason);
        });

        socket.on('reconnect', (attemptNumber) => {
            // console.log('Socket reconnected after', attemptNumber, 'attempts');
        });

        socket.on('reconnect_error', (error) => {
            // console.error('Socket reconnection error:', error);
        });
    }
    return socket;
};

export const connectSocket = () => {
    const socket = getSocket();
    if (!socket.connected) {
        socket.connect();
    }
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
