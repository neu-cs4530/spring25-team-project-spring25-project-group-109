import { useState, useEffect } from 'react';
import { RankedUser, YouTubeVideo } from '@fake-stack-overflow/shared';
import getVideosByUsername from '../services/youtubeVideoService';

const useLeaderboard = (username: string) => {
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideosByUsername(username); // get ranked users by username
        setUsers(data);
      } catch (err) {
        setError('Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchVideos();
  }, [username]);

  return { users, loading, error };
};

export default useLeaderboard;
