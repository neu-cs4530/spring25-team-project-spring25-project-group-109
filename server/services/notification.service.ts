import mongoose from 'mongoose';
import NotificationModel from '../models/notification.model';
import UserModel from '../models/users.model';
import {
  Notification,
  DatabaseNotification,
  NotificationResponse,
  NotificationsResponse,
} from '../types/types';

/**
 * Saves a new notification to the database.
 *
 * @param {Notification} notification - The notification object to be saved.
 * @returns {Promise<NotificationResponse>} - Resolves with the saved notification object or an error message.
 */
export const saveNotification = async (
  notification: Notification,
): Promise<NotificationResponse> => {
  try {
    const result: DatabaseNotification = await NotificationModel.create(notification);
    return result;
  } catch (error) {
    return { error: `Error occurred when saving user: ${error}` };
  }
};

/**
 * Retrieves all notifications of the provided user.
 *
 * @param username - the username of the user.
 * @returns {Promise<NotificationsResponse>} - an array of notifications or an empty array.
 */
export const getNotificationsByUsername = async (
  username: string,
): Promise<NotificationsResponse> => {
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

/**
 * Toggles the seen field of the notification.
 *
 * @param {string} id - The notification id
 * @returns {Promise<NotificationResponse>} - Resolves with the updated notification object or an error message.
 */
export const updateNotificationSeen = async (id: string): Promise<DatabaseNotification> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId: ${id}`);
    }

    const notification: DatabaseNotification | null = await NotificationModel.findById(id);
    if (!notification) {
      throw new Error(`Notification does not exist`);
    }

    const updatedNotification: DatabaseNotification | null =
      await NotificationModel.findOneAndUpdate(
        { _id: id },
        { seen: !notification.seen },
        { new: true },
      );

    if (!updatedNotification) {
      throw new Error(`Notification update failed`);
    }

    return updatedNotification;
  } catch (error) {
    throw new Error(`Error occurred when updating notification: ${error}`);
  }
};
