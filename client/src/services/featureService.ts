import { DatabaseFeature } from '@fake-stack-overflow/shared';
import api from './config';

const USER_API_URL = `${process.env.REACT_APP_SERVER_URL}/features`;

/**
 * Function to get badges
 *
 * @throws Error if there is an issue fetching badges.
 */
export const getFeatures = async (): Promise<DatabaseFeature[]> => {
  const res = await api.get(`${USER_API_URL}/getFeatures`);
  if (res.status !== 200) {
    throw new Error('Error when fetching features');
  }
  return res.data;
};

export default getFeatures;
