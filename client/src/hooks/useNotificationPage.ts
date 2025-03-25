import { useEffect, useState } from 'react';
import { DatabaseNotification, NotificationType, NotificationUpdatePayload } from '../types/types';
import {
  getNotificationsByUsername,
  toggleNotificationSeen,
} from '../services/notificationService';
import useUserContext from './useUserContext';

const useNotifications = (username: string) => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, socket } = useUserContext();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getNotificationsByUsername(username);
        setNotifications(data);
      } catch (err) {
        setError('Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    const handleNotificationUpdate = (update: NotificationUpdatePayload) => {
      setNotifications(prevNotifications => {
        if (update.type === 'created' && update.notification.username === user.username) {
          const exists = prevNotifications.some(n => n._id === update.notification._id);
          if (!exists) {
            return [update.notification, ...prevNotifications];
          }
        } else {
          return prevNotifications.map(n =>
            n._id === update.notification._id ? update.notification : n,
          );
        }
        return prevNotifications;
      });
    };

    fetchNotifications();

    socket.on('notificationUpdate', handleNotificationUpdate);

    return () => {
      socket.off('notificationUpdate', handleNotificationUpdate);
    };
  }, [username]);

  const toggleSeen = async (notificationId: string) => {
    try {
      const updatedNotification = await toggleNotificationSeen(notificationId);

      setNotifications(prev =>
        prev.map(n =>
          n._id.toString() === notificationId ? { ...n, seen: updatedNotification.seen } : n,
        ),
      );
    } catch (err) {
      setError('Error marking notification as seen');
    }
  };

  const filterByType = (type: NotificationType) => notifications.filter(n => n.type === type);

  return {
    notifications,
    setNotifications,
    loading,
    error,
    toggleSeen,
    filterByType,
  };
};

export default useNotifications;
