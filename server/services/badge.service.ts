import { ObjectId } from 'mongodb';
import { Badge, BadgeResponse, BadgesResponse, BadgeType, DatabaseBadge } from '../types/types';
import BadgeModel from '../models/badge.model';

// todo javadoc
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
