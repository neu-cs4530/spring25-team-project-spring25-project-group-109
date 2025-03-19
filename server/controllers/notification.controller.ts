import express, { Response, Router } from 'express';
import getNotificationsByUsername from '../services/notification.service';
import { GetNotificationsForUserRequest } from '../types/types';

const notificationController = () => {
  const router: Router = express.Router();

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

  router.get('/getNotifications/:username', getNotificationsForUser);

  return router;
};

export default notificationController;
