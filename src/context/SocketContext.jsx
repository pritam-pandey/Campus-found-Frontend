import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { API_BASE, getToken } from '../api/client';

// Socket.IO shares the backend origin: same-origin in dev (Vite proxy) and
// when the SPA is served by the backend; the API host when deployed apart.
const SOCKET_URL = API_BASE.startsWith('http')
  ? API_BASE.replace(/\/api\/?$/, '')
  : undefined; // undefined → same origin

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      setSocket(null);
      return undefined;
    }

    const s = io(SOCKET_URL || '/', {
      auth: { token: token || getToken() || document.cookie.split('token=')[1]?.split(';')[0] },
      transports: ['websocket', 'polling'],
    });

    setSocket(s);
    return () => s.disconnect();
  }, [user, token]);

  const value = useMemo(() => ({ socket }), [socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
};
