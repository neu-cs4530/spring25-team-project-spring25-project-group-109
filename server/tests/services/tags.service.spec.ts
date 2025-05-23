import TagModel from '../../models/tags.model';
import QuestionModel from '../../models/questions.model';
import {
  addTag,
  processTags,
  getTagCountMap,
  getMostRecentQuestionTags,
} from '../../services/tag.service';
import { POPULATED_QUESTIONS, tag1, tag2, tag3 } from '../mockData.models';
import { DatabaseTag } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Tag model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
  });

  describe('addTag', () => {
    test('addTag return tag if the tag already exists', async () => {
      mockingoose(TagModel).toReturn(tag1, 'findOne');

      const result = (await addTag({
        name: tag1.name,
        description: tag1.description,
      })) as DatabaseTag;

      expect(result._id).toEqual(tag1._id);
    });

    test('addTag return tag id of new tag if does not exist in database', async () => {
      mockingoose(TagModel).toReturn(null, 'findOne');

      const result = await addTag({ name: tag2.name, description: tag2.description });

      expect(result).toBeDefined();
    });

    test('addTag returns null if findOne throws an error', async () => {
      mockingoose(TagModel).toReturn(new Error('error'), 'findOne');

      const result = await addTag({ name: tag1.name, description: tag1.description });

      expect(result).toBeNull();
    });

    test('addTag returns null if save throws an error', async () => {
      mockingoose(TagModel).toReturn(null, 'findOne');
      jest.spyOn(TagModel, 'create').mockRejectedValueOnce(new Error('error'));

      const result = await addTag({ name: tag2.name, description: tag2.description });

      expect(result).toBeNull();
    });
  });

  describe('processTags', () => {
    test('processTags should return the tags of tag names in the collection', async () => {
      mockingoose(TagModel).toReturn(tag1, 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(2);
      expect(result[0]._id).toEqual(tag1._id);
      expect(result[1]._id).toEqual(tag1._id);
    });

    test('processTags should return a list of new tags ids if they do not exist in the collection', async () => {
      mockingoose(TagModel).toReturn(null, 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(2);
    });

    test('processTags should return empty list if an error is thrown when finding tags', async () => {
      mockingoose(TagModel).toReturn(Error('Dummy error'), 'findOne');

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(0);
    });

    test('processTags should return empty list if an error is thrown when saving tags', async () => {
      mockingoose(TagModel).toReturn(null, 'findOne');
      jest.spyOn(TagModel, 'create').mockRejectedValueOnce(new Error('error'));

      const result = await processTags([tag1, tag2]);

      expect(result.length).toEqual(0);
    });
  });

  describe('getTagCountMap', () => {
    test('getTagCountMap should return a map of tag names and their counts', async () => {
      mockingoose(TagModel).toReturn([tag1, tag2, tag3], 'find');
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      QuestionModel.schema.path('tags', Object);

      const result = await getTagCountMap(); // ) as Map<string, number>;

      if (!result || 'error' in result) {
        throw new Error('Expected map, got undefined or error.');
      }

      expect(result.size).toEqual(3);
      expect(result.get('react')).toEqual(1);
      expect(result.get('javascript')).toEqual(2);
      expect(result.get('android')).toEqual(1);
    });

    test('getTagCountMap should return an object with error if an error is thrown', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'find');

      const result = await getTagCountMap();

      if (result && 'error' in result) {
        expect(true).toBeTruthy();
      } else {
        expect(false).toBeTruthy();
      }
    });

    test('getTagCountMap should return an object with error if an error is thrown when finding tags', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      mockingoose(TagModel).toReturn(new Error('error'), 'find');

      const result = await getTagCountMap();

      if (result && 'error' in result) {
        expect(true).toBeTruthy();
      } else {
        expect(false).toBeTruthy();
      }
    });

    test('getTagCountMap should return null if TagModel find returns null', async () => {
      mockingoose(QuestionModel).toReturn(POPULATED_QUESTIONS, 'find');
      mockingoose(TagModel).toReturn(null, 'find');

      const result = await getTagCountMap();

      expect(result).toBeNull();
    });

    test('getTagCountMap should return default map if QuestionModel find returns null but not tag find', async () => {
      mockingoose(QuestionModel).toReturn(null, 'find');
      mockingoose(TagModel).toReturn([tag1], 'find');

      const result = (await getTagCountMap()) as Map<string, number>;

      expect(result.get('react')).toBe(0);
    });

    test('getTagCountMap should return null if find returns []', async () => {
      mockingoose(QuestionModel).toReturn([], 'find');
      mockingoose(TagModel).toReturn([], 'find');

      const result = await getTagCountMap();

      expect(result).toBeNull();
    });
  });

  describe('getMostRecentQuestionTags', () => {
    beforeEach(() => {
      // Store the original fetch before mocking it
      mockingoose(QuestionModel).reset();
      mockingoose(TagModel).reset();
      jest.clearAllMocks();
    });

    it('should return error if questions length is 0', async () => {
      const askedBy = 'testUser';
      mockingoose(QuestionModel).toReturn([], 'find');

      const result = await getMostRecentQuestionTags(askedBy);

      expect((result as { error: string }).error).toBe('Error when fetching tags');
    });

    it('should return the tags of the most recent question', async () => {
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

      const result = await getMostRecentQuestionTags(askedBy);

      expect((result as DatabaseTag[])[0].name).toEqual('tag2');
      expect((result as DatabaseTag[])[1].name).toEqual('tag3');
    });

    it('should return error if no questions are found', async () => {
      jest.spyOn(QuestionModel, 'find').mockResolvedValueOnce([]);
      const usernameNoQuestions = 'user123';

      const tags = await getMostRecentQuestionTags(usernameNoQuestions);

      expect((tags as { error: string }).error).toBe('Error when fetching tags');
    });

    it('should return error if no tags are found', async () => {
      const mockQuestion = {
        askedBy: 'user123',
        tags: [],
      };

      jest.spyOn(QuestionModel, 'find').mockResolvedValueOnce([mockQuestion]);
      jest.spyOn(TagModel, 'find').mockResolvedValueOnce(mockQuestion.tags);

      const tags = await getMostRecentQuestionTags(mockQuestion.askedBy);

      expect((tags as { error: string }).error).toBe('Error when fetching tags');
    });

    it('should return error if the most recent question does not have tags', async () => {
      const askedBy = 'testUser';

      const mockQuestions = [
        {
          askedBy,
          askDateTime: new Date('2024-01-02T10:00:00Z'),
          tags: null,
        },
      ];

      mockingoose(QuestionModel).toReturn(mockQuestions, 'find');

      const result = await getMostRecentQuestionTags(askedBy);

      expect((result as { error: string }).error).toBe('Error when fetching tags');
    });
  });
});
