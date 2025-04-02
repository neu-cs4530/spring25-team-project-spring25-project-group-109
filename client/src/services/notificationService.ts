import { DatabaseNotification } from '../types/types';
import api from './config';

const NOTIFICATION_API_URL = `${process.env.REACT_APP_SERVER_URL}/notification`;

/**
 * Function to get notifications
 *
 * @throws Error if there is an issue fetching notifications.
 */
const getNotificationsByUsername = async (username: string): Promise<DatabaseNotification[]> => {
  const res = await api.get(`${NOTIFICATION_API_URL}/getNotifications/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching notifications');
  }
  return res.data;
};

/**
 * Function to mark notification as seen or unseen
 *
 * @throws Error if there is an issue toggling seen
 */
const toggleNotificationSeen = async (id: string): Promise<DatabaseNotification> => {
  const res = await api.patch(`${NOTIFICATION_API_URL}/toggleSeen/${id}`);
  if (res.status !== 200) {
    throw new Error('Error when toggling notification seen');
  }
  return res.data;
};

export { getNotificationsByUsername, toggleNotificationSeen };
