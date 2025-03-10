import { Badge, BadgeResponse, BadgesResponse, BadgeType, DatabaseBadge } from '../types/types';
import BadgeModel from '../models/badge.model';

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

    if (!result) {
      throw Error('Failed to create user badge');
    }
    return result;
  } catch (error) {
    return { error: `Error creating user badge: ${error}` };
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
    return badges;
  } catch (error) {
    throw new Error(`Error retrieving badges: ${error}`);
  }
};
