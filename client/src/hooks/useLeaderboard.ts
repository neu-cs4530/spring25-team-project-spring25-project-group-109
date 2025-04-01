import { useState, useEffect } from 'react';
import { RankedUser } from '@fake-stack-overflow/shared';
import dayjs, { Dayjs } from 'dayjs';
import getRankedLeaderboard from '../services/leaderboardService';

const useLeaderboard = (
  username: string,
  dateFilter?: string,
  startDate?: Dayjs | null,
  endDate?: Dayjs | null,
) => {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const assembleLeaderboard = async () => {
      try {
        const data = await getRankedLeaderboard(username, dateFilter, startDate, endDate);
        setUsers(data);
        setError(null);
      } catch (err) {
        setError('Failed to assemble a leaderboard');
      } finally {
        setLoading(false);
      }
    };

    if (username) assembleLeaderboard();
  }, [username, dateFilter, startDate, endDate]);

  return { users, loading, error };
};

export default useLeaderboard;
