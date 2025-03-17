import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/notification.service';
import { mockDatabaseNotification, mockNotificationJSONResponse } from '../mockData.models';

const getNotificationsByUsernameSpy = jest.spyOn(util, 'default');

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
