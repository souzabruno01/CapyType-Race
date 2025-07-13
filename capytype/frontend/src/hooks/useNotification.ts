import { useState, useCallback } from 'react';

/**
 * Custom hook for managing notifications
 */
export const useNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const showNotificationWithMessage = useCallback((message: string, duration: number = 3000) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), duration);
  }, []);

  return {
    showNotification,
    notificationMessage,
    showNotificationWithMessage,
    setShowNotification,
    setNotificationMessage
  };
};
