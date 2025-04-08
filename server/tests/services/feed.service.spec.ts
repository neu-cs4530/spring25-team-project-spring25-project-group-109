import { ObjectId } from 'mongodb';
import QuestionModel from '../../models/questions.model';
import fetchQuestionsByFollowedActivity from '../../services/feed.service';
import { POPULATED_FEED_QUESTIONS } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Test Feed Service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('fetchQuestionsByFollowedActivity', () => {
    test('get questions by following, sorted by most recent', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_FEED_QUESTIONS, 'find');
      QuestionModel.schema.path('answers', Object);
      QuestionModel.schema.path('tags', Object);
      QuestionModel.schema.path('comments', Object);

      const result = await fetchQuestionsByFollowedActivity(['user1', 'user2', 'user3']);

      if ('error' in result) {
        throw new Error(result.error);
      }

      expect(result.length).toEqual(3);
      expect(result[0]._id.toString()).toEqual('65e9b58910afe6e94fc6e6dc');
      expect(result[1]._id.toString()).toEqual('65e9b5a995b6c7045a30d823');
      expect(result[2]._id.toString()).toEqual('65e9b9b44c052f0a08ecade0');
    });

    test('fetchQuestionsByFollowedActivity should return empty list if find throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

      const result = await fetchQuestionsByFollowedActivity(['user1', 'user2', 'user3']);

      expect(result).toEqual({ error: 'Error fetching questions by followed activity' });
    });

    test('correctly identifies feedReasons and followedUpvoters', async () => {
      const mockQuestion = {
        _id: new ObjectId(),
        title: 'Sample Q',
        text: 'text',
        tags: [],
        answers: [],
        comments: [],
        views: [],
        downVotes: [],
        askDateTime: new Date(),
        askedBy: { username: 'user1' },
        upVotes: ['user2', 'stranger'],
        toObject() {
          return { ...this };
        },
      };

      mockingoose(QuestionModel).toReturn([mockQuestion], 'find');
      QuestionModel.schema.path('askedBy', Object);
      QuestionModel.schema.path('answers', Object);
      QuestionModel.schema.path('tags', Object);
      QuestionModel.schema.path('comments', Object);

      const result = await fetchQuestionsByFollowedActivity(['user1', 'user2']);

      if ('error' in result) throw new Error(result.error);

      expect(result[0].feedReasons).toEqual(['askedByFollowed', 'upvotedByFollowed']);
      expect(result[0].followedUpvoters).toEqual(['user2']);
    });
  });
});
