import axios from 'axios';
import { PopulatedDatabaseQuestion } from '../types/types';

const API_BASE_URL = `${process.env.REACT_APP_SERVER_URL}/feed`;

/**
 * Fetches a personalized feed of questions for the user.
 *
 * @param username - The username of the user whose personalized feed to fetch.
 * @returns {Promise<PopulatedDatabaseQuestion[]>} - A promise that resolves to a list of questions.
 * @throws {Error} - If the request fails.
 */
export const getPersonalizedFeed = async (
  username: string,
): Promise<PopulatedDatabaseQuestion[]> => {
  const response = await axios.get(`${API_BASE_URL}/getRecommendedFeed/${username}`);
  if (response.status !== 200) {
    throw new Error('Failed to fetch personalized feed');
  }
  return response.data;
};

export default { getPersonalizedFeed };
