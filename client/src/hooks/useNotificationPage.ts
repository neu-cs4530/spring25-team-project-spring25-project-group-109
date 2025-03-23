import { useEffect, useState } from 'react';
import { DatabaseNotification, NotificationType } from '../types/types';
import {
  getNotificationsByUsername,
  toggleNotificationSeen,
} from '../services/notificationService';

const useNotifications = (username: string) => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotificationsByUsername(username);
        setNotifications(data);
      } catch (err) {
        setError('Error fetching notifications');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchNotifications();
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

  return { notifications, loading, error, toggleSeen, filterByType };
};

export default useNotifications;
