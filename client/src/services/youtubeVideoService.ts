import { YouTubeVideo } from '@fake-stack-overflow/shared';
import api from './config';

const VIDEOS_API_URL = `${process.env.REACT_APP_SERVER_URL}/videos`;

/**
 * Function to get videos
 *
 * @throws Error if there is an issue fetching videos.
 */
const getVideosByUsername = async (username: string): Promise<YouTubeVideo[]> => {
  const res = await api.get(`${VIDEOS_API_URL}/getYoutubeVideos/${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching videos');
  }
  return res.data;
};

export default getVideosByUsername;
