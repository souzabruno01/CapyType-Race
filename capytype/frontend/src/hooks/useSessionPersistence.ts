import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

/**
 * Custom hook to handle session persistence and restoration
 */
export const useSessionPersistence = () => {
  const navigate = useNavigate();
  const { roomId, isAdmin } = useGameStore();

  useEffect(() => {
    // Try to restore session from sessionStorage on page refresh
    const storedRoomId = sessionStorage.getItem('capy_room_id');
    const storedNickname = sessionStorage.getItem('capy_nickname');
    const storedIsAdmin = sessionStorage.getItem('capy_is_admin');
    const storedAvatarColor = sessionStorage.getItem('capy_avatar_color');
    const storedAvatarFile = sessionStorage.getItem('capy_avatar_file');
    
    if (!roomId && storedRoomId && storedNickname) {
      console.log('[useSessionPersistence] Restoring session from storage:', { 
        roomId: storedRoomId, 
        nickname: storedNickname,
        isAdmin: storedIsAdmin === 'true'
      });
      
      // Restore admin status
      if (storedIsAdmin === 'true') {
        useGameStore.getState().setAdmin(true);
      }
      
      // Set the room ID immediately to prevent redirect
      useGameStore.getState().setRoomId(storedRoomId);
      
      // Rejoin the room with stored credentials
      useGameStore.getState().joinRoom(
        storedRoomId, 
        storedNickname, 
        storedAvatarFile || 'Capy-face-green.png',
        storedAvatarColor || '#6ee7b7'
      );
      return;
    }
    
    if (!roomId) {
      console.log('[useSessionPersistence] No roomId and no stored session, redirecting to login');
      navigate('/');
      return;
    }
    
    // Store session data for persistence
    sessionStorage.setItem('capy_room_id', roomId);
    if (isAdmin) {
      sessionStorage.setItem('capy_is_admin', 'true');
    }
  }, [roomId, navigate, isAdmin]);

  useEffect(() => {
    // Handle browser back button and navigation
    const handlePopState = () => {
      if (roomId) {
        // Ask for confirmation before leaving
        const confirmLeave = window.confirm('Are you sure you want to leave the room? You will be disconnected.');
        if (!confirmLeave) {
          // Push the current state back to prevent navigation
          window.history.pushState(null, '', window.location.pathname);
        } else {
          // Clear session and leave
          const socket = useGameStore.getState().socket;
          if (socket) {
            socket.emit('leaveRoom');
            socket.disconnect();
          }
          sessionStorage.removeItem('capy_room_id');
          sessionStorage.removeItem('capy_nickname');
          sessionStorage.removeItem('capy_is_admin');
          useGameStore.getState().resetGame();
        }
      }
    };

    // Warn before leaving if in a room
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomId) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? You will be disconnected from the room.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [roomId]);
};
