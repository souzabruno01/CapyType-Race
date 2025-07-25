import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

/**
 * Custom hook to handle socket event listeners
 */
export const useSocketEvents = (
  setNotificationMessage: (message: string) => void,
  setShowNotification: (show: boolean) => void
) => {
  const navigate = useNavigate();

  useEffect(() => {
    const socket = useGameStore.getState().socket;

    const handleRoomJoined = ({ roomId: joinedRoomId, isAdmin: joinedIsAdmin, nickname }: { roomId: string; isAdmin: boolean; nickname: string }) => {
      console.log('[useSocketEvents] Room joined successfully:', { roomId: joinedRoomId, isAdmin: joinedIsAdmin, nickname });
      
      // Store session data for persistence
      sessionStorage.setItem('capy_room_id', joinedRoomId);
      sessionStorage.setItem('capy_nickname', nickname);
      if (joinedIsAdmin) {
        sessionStorage.setItem('capy_is_admin', 'true');
      } else {
        sessionStorage.removeItem('capy_is_admin');
      }
      
      useGameStore.setState({ roomId: joinedRoomId, isAdmin: joinedIsAdmin });
    };

    const handleRoomError = ({ message }: { message: string }) => {
      console.error('[useSocketEvents] Room error:', message);
      // Clear invalid session data
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      // Show error and redirect
      alert(message);
      navigate('/');
    };

    const handleRoomClosed = ({ message }: { message: string }) => {
      console.log('[useSocketEvents] Room was closed:', message);
      
      // Clear session data
      sessionStorage.removeItem('capy_room_id');
      sessionStorage.removeItem('capy_nickname');
      sessionStorage.removeItem('capy_is_admin');
      
      // Show the room closure message
      setNotificationMessage(`Room closed: ${message}`);
      setShowNotification(true);
      
      // Reset the game state
      useGameStore.getState().resetGame();
      
      // Navigate back to login after showing notification
      setTimeout(() => {
        setShowNotification(false);
        navigate('/');
      }, 3000);
    };

    if (socket) {
      socket.on('roomJoined', handleRoomJoined);
      socket.on('roomError', handleRoomError);
      socket.on('roomClosed', handleRoomClosed);
      
      return () => {
        socket.off('roomJoined', handleRoomJoined);
        socket.off('roomError', handleRoomError);
        socket.off('roomClosed', handleRoomClosed);
      };
    }
  }, [navigate, setNotificationMessage, setShowNotification]);
};
