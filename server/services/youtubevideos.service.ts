import { YouTubeVideo } from '../types/types';
import { YOUTUBE_API_KEY, YOUTUBE_SEARCH_URL } from '../types/constants';
import { getMostRecentQuestionTags } from './tag.service';

/**
 * Gets a list of youtube videos from the list of tags of the last question asked by the user
 * @param askedBy
 * @returns
 */
export async function fetchYoutubeVideos(
    askedBy: string,
  ): Promise<YouTubeVideo[] | { error: string }> {
    try {
      const tags = await getMostRecentQuestionTags(askedBy);
      if (!tags || 'error' in tags || tags.length === 0) {
        return []; // Return an empty array if no tags are found
      }
  
      const tagNames = tags.map(tag => tag.name);
  
      const videoSet = new Map<string, YouTubeVideo>(); // To store unique videos
  
      await Promise.all(
        tagNames.map(async tag => {
          const query = `intitle:${encodeURIComponent(tag)}`;
          const response = await fetch(
            `${YOUTUBE_SEARCH_URL}?part=snippet&q=${query}&key=${YOUTUBE_API_KEY}&maxResults=5`,
          ).catch(e => ({ error: 'Error fetching YouTube videos' }));
          if ('error' in response) {
            throw new Error(response.error);
          }
  
          const data = await response.json();
  
          (data.items || []).forEach(
            (video: {
              id: { videoId: string };
              snippet: {
                title: string;
                thumbnails: { high: { url: string } };
                channelTitle: string;
              }; // this is taking all the fields from the api call and then assigning them to our custom YoutubeVideo type
            }) => {
              const { videoId } = video.id;
              if (!videoSet.has(videoId)) {
                videoSet.set(videoId, {
                  title: video.snippet.title,
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  thumbnail: video.snippet.thumbnails.high.url,
                  channelTitle: video.snippet.channelTitle,
                });
              }
            },
          );
        }),
      );
  
      return Array.from(videoSet.values()); // Return unique videos as an array
    } catch (error) {
      return { error: 'Error fetching YouTube videos' };
    }
  }
  