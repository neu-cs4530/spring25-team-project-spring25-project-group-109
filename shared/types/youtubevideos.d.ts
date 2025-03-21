/**
 * Represents a simplified YouTube video object.
 */
export interface YouTubeVideo {
  title: string;
  url: string;
  thumbnail: string;
  channelTitle: string;
}

/**
 * Represents a Youtube video response from a tag
 */
export type YoutubeResponse = YouTubeVideo[] | { error: string };