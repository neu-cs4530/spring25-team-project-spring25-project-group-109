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

export default getBadges;
