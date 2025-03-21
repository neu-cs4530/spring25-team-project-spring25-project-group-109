import { DatabaseQuestion, DatabaseTag, Question, Tag, YouTubeVideo } from '../types/types';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import { YOUTUBE_API_KEY, YOUTUBE_SEARCH_URL } from '../types/constants';

/**
 * Checks if given question contains any tags from the given list.
 *
 * @param {Question} q - The question to check
 * @param {string[]} taglist - The list of tags to check for
 *
 * @returns {boolean} - `true` if any tag is present in the question, `false` otherwise
 */
export const checkTagInQuestion = (q: Question, taglist: string[]): boolean => {
  for (const tagname of taglist) {
    for (const tag of q.tags) {
      if (tagname === tag.name) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Adds a tag to the database if it does not already exist.
 *
 * @param {Tag} tag - The tag to add
 *
 * @returns {Promise<Tag | null>} - The added or existing tag, or `null` if an error occurred
 */
export const addTag = async (tag: Tag): Promise<DatabaseTag | null> => {
  try {
    // Check if a tag with the given name already exists
    const existingTag: DatabaseTag | null = await TagModel.findOne({ name: tag.name });

    if (existingTag) {
      return existingTag;
    }

    // If the tag does not exist, create a new one
    const savedTag: DatabaseTag = await TagModel.create(tag);

    return savedTag;
  } catch (error) {
    return null;
  }
};

/**
 * Processes a list of tags by removing duplicates, checking for existing tags in the database,
 * and adding non-existing tags. Returns an array of the existing or newly added tags.
 * If an error occurs during the process, it is logged, and an empty array is returned.
 *
 * @param tags The array of Tag objects to be processed.
 *
 * @returns A Promise that resolves to an array of Tag objects.
 */
export const processTags = async (tags: Tag[]): Promise<DatabaseTag[]> => {
  try {
    // Extract unique tag names from the provided tags array using a Set to eliminate duplicates
    const uniqueTagNamesSet: Set<string> = new Set(tags.map(tag => tag.name));

    // Create an array of unique Tag objects by matching tag names
    const uniqueTags = [...uniqueTagNamesSet].map(
      name => tags.find(tag => tag.name === name)!, // The '!' ensures the Tag is found, assuming no undefined values
    );

    // Use Promise.all to asynchronously process each unique tag.
    const processedTags = await Promise.all(
      uniqueTags.map(async tag => {
        const dbTag = await addTag(tag);

        if (dbTag) {
          return dbTag; // If the tag does not exist, attempt to add it to the database
        }

        // Throwing an error if addTag fails
        throw new Error(`Error while adding tag: ${tag.name}`);
      }),
    );

    return processedTags;
  } catch (error) {
    return [];
  }
};

/**
 * Gets a map of tags and their corresponding question counts.
 *
 * @returns {Promise<Map<string, number> | null | { error: string }>} - A map of tags to their
 *          counts, `null` if there are no tags in the database, or the error message.
 */
export const getTagCountMap = async (): Promise<Map<string, number> | null | { error: string }> => {
  try {
    const tlist: DatabaseTag[] = await TagModel.find();

    const qlist: (Omit<DatabaseQuestion, 'tags'> & { tags: DatabaseTag[] })[] =
      await QuestionModel.find().populate<{
        tags: DatabaseTag[];
      }>({
        path: 'tags',
        model: TagModel,
      });

    if (!tlist || tlist.length === 0) {
      return null;
    }

    const tmap: Map<string, number> = new Map(tlist.map(t => [t.name, 0]));

    if (qlist != null && qlist !== undefined && qlist.length > 0) {
      qlist.forEach(q => {
        q.tags.forEach(t => {
          tmap.set(t.name, (tmap.get(t.name) || 0) + 1);
        });
      });
    }

    return tmap;
  } catch (error) {
    return { error: 'Error when constructing tag map' };
  }
};

/**
 * Retreives the list of tags from the last question asked by the given
 *  user
 * @param askedBy the user which asked the question
 * @returns Promise<string[] | null>, where the string array is the array of tag names
 */
export async function getMostRecentQuestionTags(
  askedBy: string,
): Promise<DatabaseTag[] | { error: string }> {
  try {
    // Query the database for all questions asked by the user
    const questions = await QuestionModel.find({ askedBy }).sort({ askDateTime: -1 }); // Sort by askDateTime descending (most recent first)

    // Take the most recent question
    const mostRecentQuestion = questions[0];
    const mostRecentQTags = mostRecentQuestion.tags;
    if (!mostRecentQTags || mostRecentQTags.length === 0) {
      throw new Error('No tags found for the most recent question.');
    }

    // Return the tag of the most recent question
    const tags = await TagModel.find({ _id: { $in: mostRecentQTags } });
    return tags;
  } catch (error) {
    return { error: 'Error when fetching tags' };
  }
}

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
