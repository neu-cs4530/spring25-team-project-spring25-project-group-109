import { Request, Response } from 'express';
import { getBadgesList, saveBadge } from '../services/badge.service';
import { BadgeRequest } from '../types/types';

// todo javadoc
const isBadgeBodyValid = (req: BadgeRequest): boolean =>
  req.body.description !== undefined &&
  req.body.description !== '' &&
  req.body.name !== undefined &&
  req.body.name !== '' &&
  req.body.threshold !== undefined &&
  req.body.threshold !== 0 &&
  req.body.type !== undefined &&
  req.body.description !== undefined &&
  req.body.description !== '';

/**
 * Creates a badge for a user.
 *
 * @param req - The request, which should contain the userId and badgeId in the body.
 * @param res - The response, either returning the badge or an error.
 * @returns A promise resolving to void.
 */
const createBadgeForUser = async (req: BadgeRequest, res: Response): Promise<void> => {
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
