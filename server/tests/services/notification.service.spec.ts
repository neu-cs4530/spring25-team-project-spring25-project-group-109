import { DatabaseNotification, Notification } from '@fake-stack-overflow/shared';
import NotificationModel from '../../models/notification.model';
import { getNotificationsByUsername, saveNotification } from '../../services/notification.service';
import { mockDatabaseNotification, user } from '../mockData.models';
import UserModel from '../../models/users.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const notification: Notification = {
  username: 'user1',
  text: 'notification1',
  seen: false,
  type: 'badge',
};

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
});
