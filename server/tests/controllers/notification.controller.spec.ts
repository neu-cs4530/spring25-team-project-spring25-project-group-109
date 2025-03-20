import supertest from 'supertest';
import { NotificationType } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as util from '../../services/notification.service';
import { mockDatabaseNotification, mockNotificationJSONResponse } from '../mockData.models';

const createNotificationSpy = jest.spyOn(util, 'saveNotification');
const getNotificationsByUsernameSpy = jest.spyOn(util, 'getNotificationsByUsername');

describe('POST /createNotification', () => {
  it('should create a new notification given correct arguments', async () => {
    const mockReqBody = {
      username: 'user1',
      text: 'notification1',
      seen: false,
      type: 'badge' as NotificationType,
    };

    createNotificationSpy.mockResolvedValueOnce({ ...mockDatabaseNotification });

    const response = await supertest(app)
      .post('/notification/createNotification')
      .send(mockReqBody);
    expect(response.status).toBe(200);
    expect(createNotificationSpy).toHaveBeenCalledWith({
      ...mockReqBody,
    });
  });

  it('should return 400 for request missing username', async () => {
    const mockReqBody = {
      text: 'notification1',
      seen: false,
      type: 'badge' as NotificationType,
    };

    const response = await supertest(app)
      .post('/notification/createNotification')
      .send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid notification creation request');
  });

  it('should return 400 for request with empty username', async () => {
    const mockReqBody = {
      username: '',
      text: 'notification1',
      seen: false,
      type: 'badge' as NotificationType,
    };

    const response = await supertest(app)
      .post('/notification/createNotification')
      .send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid notification creation request');
  });

  it('should return 400 for request missing text', async () => {
    const mockReqBody = {
      username: 'user1',
      seen: false,
      type: 'badge' as NotificationType,
    };

    const response = await supertest(app)
      .post('/notification/createNotification')
      .send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid notification creation request');
  });

  it('should return 500 for a database error while saving user', async () => {
    const mockReqBody = {
      username: 'user1',
      text: 'notification1',
      seen: false,
      type: 'badge' as NotificationType,
    };

    createNotificationSpy.mockResolvedValueOnce({ error: 'Error saving notification' });

    const response = await supertest(app)
      .post('/notification/createNotification')
      .send(mockReqBody);
    expect(response.status).toBe(500);
  });
});

describe('GET /getNotificationsByUser', () => {
  it('should return a notification object given a valid username', async () => {
    getNotificationsByUsernameSpy.mockResolvedValueOnce([{ ...mockDatabaseNotification }]);

    const response = await supertest(app).get(
      `/notification/getNotifications/${mockDatabaseNotification.username}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ ...mockNotificationJSONResponse }]);
    expect(getNotificationsByUsernameSpy).toHaveBeenCalledWith(mockDatabaseNotification.username);
  });
  it('should return 500 for a thrown error', async () => {
    getNotificationsByUsernameSpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app).get(
      `/notification/getNotifications/${mockDatabaseNotification.username}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error fetching notifications: Test error');
  });
  it('should return 500 for a returned error', async () => {
    getNotificationsByUsernameSpy.mockResolvedValueOnce({ error: 'Test error' });

    const response = await supertest(app).get(
      `/notification/getNotifications/${mockDatabaseNotification.username}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error fetching notifications: Test error');
  });
  it('should return 404 for a missing username', async () => {
    const response = await supertest(app).get(`/notification/getNotifications`);
    expect(response.status).toBe(404);
  });
});
