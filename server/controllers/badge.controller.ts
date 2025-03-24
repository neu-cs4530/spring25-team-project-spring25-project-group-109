import express, { Request, Response, Router } from 'express';
import { checkAndAwardBadges, getBadgesList, saveBadge } from '../services/badge.service';
import { BadgeRequest, UpdateBadgeByUsernameRequest } from '../types/types';

const badgeController = () => {
  const router: Router = express.Router();

  /**
   * Checks if the badge request body is valid by ensuring all required fields are present and non-empty.
   *
   * @param {BadgeRequest} req - The badge request object containing the necessary fields.
   * @returns {boolean} - Returns true if the request body is valid, false otherwise.
   */
  const isBadgeBodyValid = (req: BadgeRequest): boolean =>
    req.body.description !== undefined &&
    req.body.description !== '' &&
    req.body.name !== undefined &&
    req.body.name !== '' &&
    req.body.threshold !== undefined &&
    req.body.threshold !== 0 &&
    req.body.type !== undefined &&
    req.body.imagePath !== undefined &&
    req.body.imagePath !== '';

  /**
   * Creates a badge for a user.
   *
   * @param req - The request, which should contain the userId and badgeId in the body.
   * @param res - The response, either returning the badge or an error.
   * @returns A promise resolving to void.
   */
  const createBadge = async (req: BadgeRequest, res: Response): Promise<void> => {
    if (!isBadgeBodyValid(req)) {
      res.status(400).send('Invalid badge body');
      return;
    }

    const badge = req.body;

    try {
      const result = await saveBadge(badge);

      if ('error' in result) {
        throw new Error(result.error);
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).send(`Error when saving user: ${error}`);
    }
  };

  /**
   * Retrieves all badges from the database.
   * @param res The response, either returning the badges or an error.
   * @returns A promise resolving to void.
   */
  const getBadges = async (_: Request, res: Response): Promise<void> => {
    try {
      const badges = await getBadgesList();

      if ('error' in badges) {
        throw Error(badges.error);
      }

      res.status(200).json(badges);
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  /**
   * Updates the badges for a user.
   * @param req The request, which should contain the username in the params.
   * @param res The response, either returning the badges or an error.
   * @returns A promise resolving to void.
   */
  const updateBadges = async (req: UpdateBadgeByUsernameRequest, res: Response): Promise<void> => {
    try {
      const { username } = req.params;
      const badges = await checkAndAwardBadges(username);
      if ('error' in badges) {
        throw Error(badges.error);
      }
      res.status(200).json({ badges });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update badges' });
    }
  };

  router.post('/addBadge', createBadge);
  router.get('/getBadges', getBadges);
  router.patch('/updateBadges/:username', updateBadges);
  return router;
};

export default badgeController;
