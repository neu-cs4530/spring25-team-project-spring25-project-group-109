import UserStatsModel from '../models/userstats.model';
import { UserStatsResponse } from '../types/types';

/**
 * Retrieves a user's stats from the database by their user id.
 *
 * @param {string} username - The user id of the user to find.
 * @returns {Promise<UserResponse>} - Resolves with the found user object (without the password) or an error message.
 */
export const getUserStats = async (username: string): Promise<UserStatsResponse> => {
  try {
    const userStats = await UserStatsModel.findOne({ username });

    if (!userStats) {
      throw Error('User stats not found');
    }

    return userStats;
  } catch (error) {
    return { error: `Error occurred when finding user: ${error}` };
  }
};

export default getUserStats;
