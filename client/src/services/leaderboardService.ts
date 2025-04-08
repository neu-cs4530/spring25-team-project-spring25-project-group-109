import { RankedUser } from '@fake-stack-overflow/shared';
import { Dayjs } from 'dayjs';
import api from './config';

const USERS_API_URL = `${process.env.REACT_APP_SERVER_URL}/user`;

/**
 * Function to get videos
 *
 * @throws Error if there is an issue fetching videos.
 */
const getRankedLeaderboard = async (
  username: string,
  dateFilter?: string,
  startDate?: Dayjs | null,
  endDate?: Dayjs | null,
): Promise<RankedUser[]> => {
  const params = new URLSearchParams();
  params.append('username', username);
  if (dateFilter) {
    params.append('dateFilter', dateFilter);
  }
  if (dateFilter === 'custom' && startDate && endDate) {
    params.append('startDate', startDate.toISOString());
    params.append('endDate', endDate.toISOString());
  }
  const res = await api.get(`${USERS_API_URL}/getUsers/ranking?${params.toString()}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching ranking');
  }
  return res.data;
};

export default getRankedLeaderboard;
