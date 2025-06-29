import { useState, useCallback } from 'react';

interface NotificationData {
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showNotification = useCallback((data: NotificationData) => {
    // First hide any existing notification
    setIsVisible(false);
    // Wait for fade out animation
    setTimeout(() => {
      setNotification(data);
      // Wait a frame to ensure the new notification is ready
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, 300);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => setNotification(null), 300);
  }, []);

  return {
    notification,
    isVisible,
    showNotification,
    hideNotification,
  };
};