import { DatabaseNotification } from '@fake-stack-overflow/shared';
import NotificationModel from '../../models/notification.model';
import getNotificationsByUsername from '../../services/notification.service';
import { mockDatabaseNotification, user } from '../mockData.models';
import UserModel from '../../models/users.model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('NotificationService', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
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
        error: 'Error retrieving notifications: Error: User testUser does not exist',
      });
    });
    it('should return an error if user model throws error', async () => {
      mockingoose(UserModel).toReturn(new Error('User model error'), 'findOne');
      const result = await getNotificationsByUsername('testUser');
      expect(result).toEqual({
        error: 'Error retrieving notifications: Error: User model error',
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
        error: 'Error retrieving notifications: Error: Notification model error',
      });
    });
  });
});
