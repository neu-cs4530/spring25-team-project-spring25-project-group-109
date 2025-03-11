import express, { Request, Response, Router } from 'express';
import { getBadgesList, saveBadge } from '../services/badge.service';
import { BadgeRequest, FakeSOSocket, UpdateBadgeByUsernameRequest } from '../types/types';
import { awardBadgeToUser, getUserByUsername } from '../services/user.service';
import { getUserStats } from '../services/userstats.service';

const badgeController = (socket: FakeSOSocket) => {
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

  // todo
  const updateBadges = async (req: UpdateBadgeByUsernameRequest, res: Response): Promise<void> => {
    try {
      // get user by username
      const user = await getUserByUsername(req.params.username);
      if (!user || 'error' in user) {
        throw new Error('User not found');
      }

      // get existing badge IDs from the user and get the user's stats
      const existingBadgeIds = new Set(user.badgesEarned.map(badge => badge.toString()));
      const userStats = await getUserStats(user.username);
      if (!userStats || 'error' in userStats) {
        throw new Error('User stats not found');
      }

      // get all badges from the database
      const allBadges = await getBadgesList();
      if (!allBadges || 'error' in allBadges) {
        throw new Error('Error retrieving badges');
      }

      // check which badges the user qualifies for but doesn't already have
      const newBadges = allBadges.filter(
        badge =>
          !existingBadgeIds.has(badge._id.toString()) &&
          ((badge.type === 'question' && userStats.questionsCount >= badge.threshold) ||
            (badge.type === 'answer' && userStats.answersCount >= badge.threshold) ||
            (badge.type === 'comment' && userStats.commentsCount >= badge.threshold) ||
            (badge.type === 'nim' && userStats.nimWinCount >= badge.threshold)),
      );

      // if there are new badges to award, update the user
      if (newBadges.length > 0) {
        await awardBadgeToUser(
          user.username,
          newBadges.map(badge => badge._id),
        );
      }
      res.status(200).json({ awardedBadges: newBadges });
    } catch (error) {
      res.status(500).send(`Error when getting users: ${error}`);
    }
  };

  router.post('/addBadge', createBadge);
  router.get('/getBadges', getBadges);
  router.put('/updateBadges/:username', updateBadges);
  return router;
};

export default badgeController;
