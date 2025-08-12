import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/gameStore';

const SocketTest = () => {
  const [status, setStatus] = useState<string>('Disconnected');
  const [error, setError] = useState<string | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const createRoom = useGameStore(state => state.createRoom);
  const storeSocket = useGameStore(state => state.socket);
  const storeRoomId = useGameStore(state => state.roomId);
  const storeError = useGameStore(state => state.lastError);
  const connectionStatus = useGameStore(state => state.connectionStatus);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };
  
  useEffect(() => {
    // Create a direct socket connection for testing
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    addLog(`Connecting to ${BACKEND_URL}`);
    
    const newSocket = io(BACKEND_URL, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: true,
      path: '/socket.io/',
      reconnection: true,
      forceNew: true
    });
    
    addLog(`Socket configuration: ${JSON.stringify({
      url: BACKEND_URL,
      transports: ['polling', 'websocket'],
      path: '/socket.io/'
    }, null, 2)}`);
    
    // Add debug event listeners
    newSocket.io.on('reconnect_attempt', (attempt) => {
      addLog(`Reconnection attempt: ${attempt}`);
    });
    
    newSocket.io.on('reconnect_error', (error) => {
      addLog(`Reconnection error: ${error.message}`);
    });
    
    newSocket.io.on('reconnect_failed', () => {
      addLog('Reconnection failed after all attempts');
    });
    
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      setStatus('Connected');
      setSocketId(newSocket.id);
      addLog(`Socket connected with ID: ${newSocket.id}`);
    });
    
    newSocket.on('disconnect', () => {
      setStatus('Disconnected');
      setSocketId(null);
      addLog('Socket disconnected');
    });
    
    newSocket.on('connect_error', (err) => {
      setStatus('Error');
      setError(err.message);
      addLog(`Connection error: ${err.message}`);
    });
    
    newSocket.on('roomCreated', (id) => {
      setRoomId(id);
      addLog(`Room created with ID: ${id}`);
    });
    
    newSocket.on('validationError', (data) => {
      setError(JSON.stringify(data));
      addLog(`Validation error: ${JSON.stringify(data)}`);
    });
    
    newSocket.on('serverError', (data) => {
      setError(JSON.stringify(data));
      addLog(`Server error: ${JSON.stringify(data)}`);
    });
    
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  const handleDirectCreateRoom = () => {
    if (!socket || !socket.connected) {
      addLog('Socket not connected, cannot create room');
      return;
    }
    
    addLog('Directly emitting createRoom event');
    socket.emit('createRoom', { 
      nickname: 'TestUser', 
      avatar: 'capybara1.png', 
      color: '#FF5733' 
    });
  };
  
  const handleStoreCreateRoom = () => {
    addLog('Using gameStore.createRoom');
    createRoom('TestUser', 'capybara1.png', '#FF5733');
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Socket Connection Test</h1>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Direct Socket Status</h2>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Socket ID:</strong> {socketId || 'None'}</p>
        <p><strong>Room ID:</strong> {roomId || 'None'}</p>
        {error && <p style={{ color: 'red' }}><strong>Error:</strong> {error}</p>}
        <button onClick={handleDirectCreateRoom}>Direct Create Room</button>
      </div>
      
      <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h2>Game Store Status</h2>
        <p><strong>Connection Status:</strong> {connectionStatus}</p>
        <p><strong>Socket ID:</strong> {storeSocket?.id || 'None'}</p>
        <p><strong>Room ID:</strong> {storeRoomId || 'None'}</p>
        {storeError && <p style={{ color: 'red' }}><strong>Error:</strong> {storeError}</p>}
        <button onClick={handleStoreCreateRoom}>Store Create Room</button>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Logs</h2>
        <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocketTest;