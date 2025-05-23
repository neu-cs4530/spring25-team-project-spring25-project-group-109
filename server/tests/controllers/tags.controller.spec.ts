import supertest from 'supertest';
import mongoose from 'mongoose';

import { ObjectId } from 'mongodb';
import { app } from '../../app';
import TagModel from '../../models/tags.model';
import { DatabaseTag, Tag } from '../../types/types';

import * as tagUtil from '../../services/tag.service';

const tag1 = { name: 'tag1', description: 'desc1', _id: new ObjectId() };
const tag2 = { name: 'tag2', description: 'desc2', _id: new ObjectId() };

const getTagCountMapSpy: jest.SpyInstance = jest.spyOn(tagUtil, 'getTagCountMap');
const getMostRecentQuestionTagsSpy = jest.spyOn(tagUtil, 'getMostRecentQuestionTags');
const findOneSpy = jest.spyOn(TagModel, 'findOne');

describe('Test tagController', () => {
  describe('GET /getTagByName/:name', () => {
    it('should return the tag when found', async () => {
      // Mock a tag object to be returned by the findOne method
      const mockTag: Tag = { name: 'exampleTag', description: 'This is a test tag' };
      const mockDatabaseTag: DatabaseTag = { ...mockTag, _id: new mongoose.Types.ObjectId() };

      findOneSpy.mockResolvedValueOnce(mockDatabaseTag);

      const response = await supertest(app).get('/tag/getTagByName/exampleTag');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockDatabaseTag, _id: mockDatabaseTag._id.toString() });
    });

    it('should return 404 if the tag is not found', async () => {
      // Mock findOne to return null to simulate tag not found
      findOneSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).get('/tag/getTagByName/nonExistentTag');

      expect(response.status).toBe(404);
      expect(response.text).toBe('Tag with name "nonExistentTag" not found');
    });

    it('should return 500 if there is an error fetching the tag', async () => {
      // Mock findOne to throw an error
      findOneSpy.mockRejectedValueOnce(new Error('Error fetching tag'));

      const response = await supertest(app).get('/tag/getTagByName/errorTag');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error when fetching tag: Error fetching tag');
    });
  });

  describe('GET /getTagsWithQuestionNumber', () => {
    it('should return tags with question numbers', async () => {
      const mockTagCountMap = new Map<string, number>();
      mockTagCountMap.set('tag1', 2);
      mockTagCountMap.set('tag2', 1);
      getTagCountMapSpy.mockResolvedValueOnce(mockTagCountMap);

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { name: 'tag1', qcnt: 2 },
        { name: 'tag2', qcnt: 1 },
      ]);
    });

    it('should return error 500 if getTagCountMap returns null', async () => {
      getTagCountMapSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(500);
    });

    it('should return error 500 if getTagCountMap throws an error', async () => {
      getTagCountMapSpy.mockRejectedValueOnce(new Error('Error fetching tags'));

      const response = await supertest(app).get('/tag/getTagsWithQuestionNumber');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getMostRecentQuestionTags/:askedBy', () => {
    it('should return tags when found', async () => {
      const mockTags: DatabaseTag[] = [tag1, tag2];
      getMostRecentQuestionTagsSpy.mockResolvedValueOnce(mockTags);

      const response = await supertest(app).get('/tag/getMostRecentQuestionTags/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        mockTags.map(tag => ({
          ...tag,
          _id: tag._id.toString(),
        })),
      );
    });

    it('should return 500 if no tags are found', async () => {
      getMostRecentQuestionTagsSpy.mockResolvedValueOnce({ error: 'No tags found for this user.' });

      const response = await supertest(app).get('/tag/getMostRecentQuestionTags/user123');

      expect(response.status).toBe(500);
      expect(response.text).toBe('No tags found for this user.');
    });

    it('should return 500 if an error occurs', async () => {
      getMostRecentQuestionTagsSpy.mockRejectedValueOnce(new Error('Error fetching tags'));

      const response = await supertest(app).get('/tag/getMostRecentQuestionTags/user123');

      expect(response.status).toBe(500);
      expect(response.text).toContain('Error fetching tags: Error fetching tags');
    });
  });
});
