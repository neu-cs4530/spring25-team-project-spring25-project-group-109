import { DatabaseBadge } from '@fake-stack-overflow/shared';
import api from './config';

const USER_API_URL = `${process.env.REACT_APP_SERVER_URL}/badge`;

/**
 * Function to get badges
 *
 * @throws Error if there is an issue fetching badges.
 */
export const getBadges = async (): Promise<DatabaseBadge[]> => {
  const res = await api.get(`${USER_API_URL}/getBadges`);
  if (res.status !== 200) {
    throw new Error('Error when fetching badges');
  }
  return res.data;
};

/**
 * Function to update (check and award) badges for a user.
 * It checks the user's stats, and if the user qualifies for any new badges,
 * they will be awarded, and their badges will be updated.
 *
 * @param {string} username - The username of the user to check and update badges for.
 * @throws Error if there is an issue updating the badges.
 */
export const updateBadges = async (username: string): Promise<void> => {
  try {
    const res = await api.patch(`${USER_API_URL}/updateBadges/${username}`);
    if (res.status !== 200) {
      throw new Error('Failed to update badges');
    }
    return res.data;
  } catch (error) {
    throw new Error('Error updating badges');
  }
};

export default {
  getBadges,
  updateBadges,
};
