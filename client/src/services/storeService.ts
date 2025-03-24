import axios from 'axios';
import { DatabaseStore } from '../types/types';

const API_BASE_URL = `${process.env.REACT_APP_SERVER_URL}/store`;

/**
 * Fetches the store data for a given username.
 *
 * @param username - The username to fetch store for.
 * @returns {Promise<Store>} - The user's store object.
 * @throws {Error} - If the request fails.
 */
const getUserStore = async (username: string): Promise<DatabaseStore> => {
  const response = await axios.get(`${API_BASE_URL}/getStoreByUser/${username}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch user store');
  }
  return response.data;
};

const purchaseFeature = async (username: string, featureName: string): Promise<DatabaseStore> => {
  const response = await axios.patch(`${API_BASE_URL}/unlockFeature`, {
    username,
    featureName,
  });

  if (response.status !== 200) {
    throw new Error(response.statusText);
  }
  return response.data;
};

export { purchaseFeature, getUserStore };
