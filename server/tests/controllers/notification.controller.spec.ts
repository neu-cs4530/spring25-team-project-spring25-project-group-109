import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/notification.service';
import { mockDatabaseNotification, mockNotificationJSONResponse } from '../mockData.models';

const createNotificationSpy = jest.spyOn(util, 'saveNotification');
const getNotificationsByUsernameSpy = jest.spyOn(util, 'getNotificationsByUsername');
const updateNotificationSeenSpy = jest.spyOn(util, 'updateNotificationSeen');

describe('POST /createNotification', () => {
  it('should create a new notification given correct arguments', async () => {
    const mockReqBody = {
      username: 'user1',
      text: 'notification1',
      seen: false,
      type: 'badge',
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
      type: 'badge',
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
      type: 'badge',
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
      type: 'badge',
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
      type: 'badge',
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

describe('PATCH /notification/toggleSeen/:id', () => {
  const notificationId = mockDatabaseNotification._id;
  const endpoint = `/notification/toggleSeen/${notificationId}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should toggle the seen status of a notification', async () => {
    updateNotificationSeenSpy.mockResolvedValueOnce(mockDatabaseNotification);

    const response = await supertest(app).patch(endpoint);

    expect(response.status).toBe(200);
  });

  it('should return 500 if updateNotificationSeen fails', async () => {
    updateNotificationSeenSpy.mockRejectedValueOnce(new Error('Database error'));

    const response = await supertest(app).patch(endpoint);

    expect(response.status).toBe(500);
    expect(response.text).toContain('Error toggling notification seen status: Database error');
  });

  it('should return 404 if notification ID is not provided', async () => {
    const response = await supertest(app).patch(`/notification/toggleSeen`);

    expect(response.status).toBe(404);
  });
});
