import express, { Response, Router } from 'express';
import getNotificationsByUsername, { saveNotification } from '../services/notification.service';
import { CreateNotificationRequest, GetNotificationsForUserRequest } from '../types/types';

const notificationController = () => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a notification.
   *
   * @param req The incoming request containing notification data.
   * @returns `true` if the body contains valid notification fields; otherwise, `false`.
   */
  const isCreateNotificationRequestValid = (req: CreateNotificationRequest): boolean => {
    const { username, text, seen, type } = req.body;
    return !!username && !!text && !!seen && !!type;
  };

  /**
   * Creates a new notification.
   *
   * @param req the request object containing the notification data.
   * @param res the response object to send the result.
   * @returns {Promise<void>} a promise that resolves when the notification is created.
   */
  const createNotification = async (
    req: CreateNotificationRequest,
    res: Response,
  ): Promise<void> => {
    if (!req.body || !isCreateNotificationRequestValid(req)) {
      res.status(400).send('Invalid collection creation request');
      return;
    }

    const { username, text, seen, type } = req.body;

    try {
      const savedNotification = await saveNotification({ username, text, seen, type });

      if ('error' in savedNotification) {
        throw new Error(savedNotification.error);
      }

      res.status(200).json(savedNotification);
    } catch (err: unknown) {
      res.status(500).send(`Error creating a notification: ${(err as Error).message}`);
    }
  };

  /**
   * Retrieves notifications of a user based on their username.
   *
   * @param req the request object containing the username parameter in `req.params`.
   * @param res the response object to send the result, either the notifications or an error message.
   * @returns {Promise<void>} a promise that resolves when the notifications are successfully retrieved.
   */
  const getNotificationsForUser = async (
    req: GetNotificationsForUserRequest,
    res: Response,
  ): Promise<void> => {
    const { username } = req.params;

    try {
      const notifications = await getNotificationsByUsername(username);
      if ('error' in notifications) {
        throw new Error(notifications.error);
      }
      res.status(200).json(notifications);
    } catch (err) {
      res.status(500).send(`Error fetching notifications: ${(err as Error).message}`);
    }
  };

  router.post('/createNotification', createNotification);
  router.get('/getNotifications/:username', getNotificationsForUser);

  return router;
};

export default notificationController;
