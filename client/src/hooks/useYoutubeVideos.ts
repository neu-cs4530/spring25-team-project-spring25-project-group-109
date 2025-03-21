import { useState, useEffect } from 'react';
import { YouTubeVideo } from '@fake-stack-overflow/shared';
import getVideosByUsername from '../services/youtubeVideoService';

const useYoutubeVideos = (username: string) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await getVideosByUsername(username);
        setVideos(data);
      } catch (err) {
        setError('Failed to fetch videos');
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchVideos();
  }, [username]);

  return { videos, loading, error };
};

export default useYoutubeVideos;
