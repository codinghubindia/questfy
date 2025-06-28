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
    setNotification(data);
    setIsVisible(true);
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