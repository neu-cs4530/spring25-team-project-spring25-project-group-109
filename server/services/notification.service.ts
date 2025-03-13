import NotificationModel from '../models/notification.model';
import UserModel from '../models/users.model';
import { DatabaseNotification, NotificationsResponse } from '../types/types';

const getNotificationsByUsername = async (username: string): Promise<NotificationsResponse> => {
  try {
    const user = await UserModel.findOne({
      username,
    });
    if (!user) {
      throw new Error(`User ${username} does not exist`);
    }
    const notifications: DatabaseNotification[] = await NotificationModel.find({ username });
    return notifications || [];
  } catch (error) {
    return { error: `Error retrieving notifications: ${error}` };
  }
};

export default getNotificationsByUsername;
