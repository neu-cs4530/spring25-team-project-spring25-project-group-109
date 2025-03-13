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
    const notifications: DatabaseNotification[] = await NotificationModel.find({ username }).lean();
    return notifications || [];
  } catch (error) {
    return { error: `Error getting notifications (${(error as Error).message})` };
  }
};

export default getNotificationsByUsername;
