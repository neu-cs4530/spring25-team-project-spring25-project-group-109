import { Badge, BadgeResponse, BadgesResponse, BadgeType, DatabaseBadge } from '../types/types';
import BadgeModel from '../models/badge.model';
import UserModel from '../models/users.model';
import UserStatsModel from '../models/userstats.model';
import { awardBadgeToUser } from './user.service';
import { saveNotification } from './notification.service';

/**
 * Saves a new badge to the database.
 *
 * @param {Badge} badge - The badge object to be saved in the database.
 * @returns {Promise<BadgeResponse>} - A promise that resolves to the saved badge data or an error response.
 *   - If successful, the saved badge object is returned.
 *   - If an error occurs, an error message is returned in the format `{ error: string }`.
 *
 * @throws {Error} - If there is an error while saving the badge, an error message is thrown.
 */
export const saveBadge = async (badge: Badge): Promise<BadgeResponse> => {
  try {
    const result: DatabaseBadge = await BadgeModel.create(badge);
    return result;
  } catch (error) {
    return { error: `Error creating user badge (${(error as Error).message})` };
  }
};

/**
 * Retrieves all badges from the database, optionally filtering by badge type.
 *
 * @param type - The optional badge type to filter by (e.g., BadgeType.QUESTION).
 * @returns {Promise<DatabaseBadge[]>} - A list of badges matching the criteria.
 */
export const getBadgesList = async (type?: BadgeType): Promise<BadgesResponse> => {
  try {
    const query = type ? { type } : {};
    const badges: DatabaseBadge[] = await BadgeModel.find(query);
    return badges || [];
  } catch (error) {
    return { error: `Error retrieving badges: ${error}` };
  }
};

export const checkAndAwardBadges = async (username: string): Promise<BadgesResponse> => {
  try {
    // get user by username
    const user = await UserModel.findOne({ username });
    if (!user) throw new Error('User not found');

    // get existing badge IDs from the user and get the user's stats
    const userStats = await UserStatsModel.findOne({ username: user.username });
    if (!userStats) throw new Error('User stats not found');

    // get all badges from the database
    const allBadges = await getBadgesList();
    if (!allBadges || 'error' in allBadges) throw new Error('Could not retrieve badges');

    // find badges the user qualifies for but doesn't already have
    const existingBadgeIds = new Set(user.badgesEarned.map(badge => badge.badgeId.toString()));
    const newBadges = allBadges.filter(
      badge =>
        !existingBadgeIds.has(badge._id.toString()) &&
        ((badge.type === 'question' && userStats.questionsCount >= badge.threshold) ||
          (badge.type === 'answer' && userStats.answersCount >= badge.threshold) ||
          (badge.type === 'comment' && userStats.commentsCount >= badge.threshold) ||
          (badge.type === 'nim' && userStats.nimWinCount >= badge.threshold)),
    );

    if (newBadges.length > 0) {
      await awardBadgeToUser(
        user.username,
        newBadges.map(badge => badge._id),
      );

      // send a notification for each badge earned
      for (const badge of newBadges) {
        saveNotification({
          username: user.username,
          text: `You have earned the badge ${badge.name}!`,
          seen: false,
          type: 'badge',
        });
      }
    }
    return newBadges;
  } catch (error) {
    return { error: `Error awarding badges: ${error}` };
  }
};
