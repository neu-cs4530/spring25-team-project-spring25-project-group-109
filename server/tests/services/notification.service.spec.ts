import { DatabaseNotification } from '../../types/types';
import NotificationModel from '../../models/notification.model';
import {
  getNotificationsByUsername,
  saveNotification,
  updateNotificationSeen,
} from '../../services/notification.service';
import { notification, mockDatabaseNotification, user } from '../mockData.models';
import UserModel from '../../models/users.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('NotificationService', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('saveNotification', () => {
    it('should return the saved notification', async () => {
      mockingoose(NotificationModel).toReturn(mockDatabaseNotification, 'create');

      const result = (await saveNotification(notification)) as DatabaseNotification;

      expect(result._id).toBeDefined();
      expect(result.username).toEqual(notification.username);
      expect(result.text).toEqual(notification.text);
      expect(result.seen).toEqual(notification.seen);
      expect(result.type).toEqual(notification.type);
    });

    it('should throw an error if error when saving to database', async () => {
      jest
        .spyOn(NotificationModel, 'create')
        .mockRejectedValueOnce(() => new Error('Error saving document'));

      const saveError = await saveNotification(notification);

      expect('error' in saveError).toBe(true);
    });
  });

  describe('getNotificationsByUsername', () => {
    it('should return notifications for a user', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(NotificationModel).toReturn([mockDatabaseNotification], 'find');

      const result = (await getNotificationsByUsername('testUser')) as DatabaseNotification[];
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockDatabaseNotification);
    });
    it('should return an error if user does not exist', async () => {
      mockingoose(UserModel).toReturn(null, 'findOne');
      const result = await getNotificationsByUsername('testUser');
      expect(result).toEqual({
        error: 'Error getting notifications (User testUser does not exist)',
      });
    });
    it('should return an error if user model throws error', async () => {
      mockingoose(UserModel).toReturn(new Error('User model error'), 'findOne');
      const result = await getNotificationsByUsername('testUser');
      expect(result).toEqual({
        error: 'Error getting notifications (User model error)',
      });
    });
    it('should return empty list if notifications return null', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(NotificationModel).toReturn(null, 'find');
      const result = await getNotificationsByUsername('testUser');
      expect(result).toEqual([]);
    });
    it('should return an error if notification model throws error', async () => {
      mockingoose(UserModel).toReturn(user, 'findOne');
      mockingoose(NotificationModel).toReturn(new Error('Notification model error'), 'find');
      const result = await getNotificationsByUsername('testUser');
      expect(result).toEqual({
        error: 'Error getting notifications (Notification model error)',
      });
    });
  });

  describe('updateNotificationSeen', () => {
    beforeEach(() => {
      mockingoose.resetAll();
      jest.clearAllMocks();
    });

    it('should throw an error if findOneAndUpdate fails', async () => {
      const notificationId = String(mockDatabaseNotification._id);
      const errorMessage =
        'Error occurred when updating notification: Error: Notification update failed';
      mockingoose(NotificationModel).toReturn(mockDatabaseNotification, 'findOne');
      mockingoose(NotificationModel).toReturn(null, 'findOneAndUpdate');
      try {
        const result = await updateNotificationSeen(notificationId);
        expect(result).toBeUndefined();
      } catch (error) {
        expect(error).toEqual(new Error(errorMessage));
      }
    });

    it('should successfully toggle the seen status of a notification', async () => {
      const updatedNotification = {
        ...mockDatabaseNotification,
        seen: !mockDatabaseNotification.seen,
      };

      mockingoose(NotificationModel).toReturn(mockDatabaseNotification, 'findOne');
      mockingoose(NotificationModel).toReturn(updatedNotification, 'findOneAndUpdate');

      const result = await updateNotificationSeen(String(mockDatabaseNotification._id));

      expect(result.username).toEqual(updatedNotification.username);
      expect(result.text).toEqual(updatedNotification.text);
      expect(result.seen).toEqual(updatedNotification.seen);
      expect(result.link).toEqual(updatedNotification.link);
      expect(result.type).toEqual(updatedNotification.type);
    });

    it('should throw an error if the provided ID is invalid', async () => {
      const invalidId = 'invalid_id';

      await expect(updateNotificationSeen(invalidId)).rejects.toThrow(
        `Invalid ObjectId: ${invalidId}`,
      );
    });

    it('should throw an error if the notification does not exist', async () => {
      const nonExistentId = '60d5ec49f16e1b35d8f2b1b5';

      mockingoose(NotificationModel).toReturn(null, 'findOne');

      await expect(updateNotificationSeen(nonExistentId)).rejects.toThrow(
        'Notification does not exist',
      );
    });
  });
});
