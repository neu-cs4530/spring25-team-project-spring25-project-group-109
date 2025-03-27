import TagModel from '../../models/tags.model';
import QuestionModel from '../../models/questions.model';
import fetchYoutubeVideos from '../../services/youtubevideos.service';
import { POPULATED_QUESTIONS, tag1, tag2, tag3 } from '../mockData.models';
import { DatabaseTag } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Tag model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('fetchYoutubeVideos', () => {
    let originalFetch: typeof fetch;

    beforeEach(() => {
      originalFetch = global.fetch;
      mockingoose.resetAll();
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      jest.restoreAllMocks();
    });

    it('should return YouTube videos for found tags', async () => {
      mockingoose(TagModel).toReturn([tag1, tag2, tag3], 'find');
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      QuestionModel.schema.path('tags', Object);

      const askedBy = 'testUser';
      const mockQuestions = [
        {
          askedBy,
          askDateTime: new Date('2024-01-02T10:00:00Z'),
          tags: [{ name: 'tag2' }, { name: 'tag3' }] as DatabaseTag[],
        },
        {
          askedBy,
          askDateTime: new Date('2024-01-01T10:00:00Z'),
          tags: [{ name: 'tag1' }] as DatabaseTag[],
        },
      ];

      mockingoose(QuestionModel).toReturn(mockQuestions, 'find');
      mockingoose(TagModel).toReturn(mockQuestions[0].tags, 'find');

      global.fetch = async () =>
        ({
          status: 200,
          json: async () => ({
            items: [
              {
                id: { videoId: '1' }, // Ensure correct structure
                snippet: {
                  title: 'video1',
                  thumbnails: { high: { url: 'fakeUrl' } },
                  channelTitle: 'testTitle',
                },
              },
            ],
          }),
        }) as Response;

      const videos = await fetchYoutubeVideos(askedBy);

      expect(videos).toEqual([
        {
          title: 'video1',
          url: 'https://www.youtube.com/watch?v=1',
          thumbnail: 'fakeUrl',
          channelTitle: 'testTitle',
        },
      ]);
    });

    it('should return empty array if no tags are found', async () => {
      const mockQuestion = {
        askedBy: 'user123',
        tags: [],
      };

      jest.spyOn(QuestionModel, 'find').mockResolvedValueOnce([mockQuestion]);
      jest.spyOn(TagModel, 'find').mockResolvedValueOnce(mockQuestion.tags);

      const videos = await fetchYoutubeVideos(mockQuestion.askedBy);

      expect(videos).toEqual([]);
    });

    it('should return an error if there is an error in returning videos', async () => {
      const askedBy = 'testUser';
      const mockQuestions = [
        {
          askedBy,
          askDateTime: new Date('2024-01-02T10:00:00Z'),
          tags: [{ name: 'tag2' }, { name: 'tag3' }] as DatabaseTag[],
        },
        {
          askedBy,
          askDateTime: new Date('2024-01-01T10:00:00Z'),
          tags: [{ name: 'tag1' }] as DatabaseTag[],
        },
      ];
      mockingoose(QuestionModel).toReturn(mockQuestions, 'find');
      mockingoose(TagModel).toReturn(mockQuestions[0].tags, 'find');

      global.fetch = async () => {
        throw new Error();
      };

      const videos = await fetchYoutubeVideos(askedBy);

      expect((videos as { error: string }).error).toBe('Error fetching YouTube videos');
    });
  });
});
