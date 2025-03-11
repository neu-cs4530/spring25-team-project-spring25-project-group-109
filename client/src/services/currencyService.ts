import axios from 'axios';
import { Currency, DatabaseCurrency } from '../types/types';

const API_BASE_URL = `${process.env.REACT_APP_SERVER_URL}/currency`;

/**
 * Fetches the currency data for a given username.
 *
 * @param username - The username to fetch currency for.
 * @returns {Promise<Currency>} - The user's currency object.
 * @throws {Error} - If the request fails.
 */
const getUserCurrency = async (username: string): Promise<Currency> => {
  const response = await axios.get(`${API_BASE_URL}/getCurrencyByUser/${username}`);

  if (response.status !== 200) {
    throw new Error('Failed to fetch user currency');
  }
  return response.data;
};

const updateCoins = async (username: string, amount: number): Promise<DatabaseCurrency | null> => {
  const response = await axios.post(`${API_BASE_URL}/updateCoins`, {
    username,
    amount,
  });
  if (response.status !== 200) {
    throw new Error('Failed to update coins');
  }
  return response.data;
};

export { getUserCurrency, updateCoins };
