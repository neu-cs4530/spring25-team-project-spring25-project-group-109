import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/collection.service';
import { DatabaseCollection, Collection } from '../../types/types';

const mockCollection: Collection = {
  name: 'favorites',
  username: 'user1',
  questions: [],
  visibility: 'public',
};

const mockDatabaseCollection: DatabaseCollection = {
  _id: new mongoose.Types.ObjectId(),
  name: 'favorites',
  username: 'user1',
  questions: [],
  visibility: 'public',
};

const mockCollectionJSONResponse = {
  _id: mockDatabaseCollection._id.toString(),
  name: 'favorites',
  username: 'user1',
  questions: [],
  visibility: 'public',
};

const saveCollectionSpy = jest.spyOn(util, 'saveCollection');
const getCollectionsByUserSpy = jest.spyOn(util, 'getCollectionsByUser');

describe('Test Collection Controller', () => {
  describe('POST /createCollection', () => {
    it('should create a new collection given correct arguments', async () => {
      saveCollectionSpy.mockResolvedValueOnce({ ...mockDatabaseCollection });

      const response = await supertest(app)
        .post('/collection/createCollection')
        .send(mockCollection);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockCollectionJSONResponse });
      expect(saveCollectionSpy).toHaveBeenCalledWith({ ...mockCollection });
    });

    it('should return 400 for a missing name', async () => {
      const mockReqBody = {
        username: 'user1',
        questions: [],
        visibility: 'public',
      };

      const response = await supertest(app).post('/collection/createCollection').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collection creation request');
    });

    it('should return 400 for a missing username', async () => {
      const mockReqBody = {
        name: 'abc',
        questions: [],
        visibility: 'public',
      };

      const response = await supertest(app).post('/collection/createCollection').send(mockReqBody);
      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid collection creation request');
    });

    it('should return 500 for a database error', async () => {
      saveCollectionSpy.mockResolvedValueOnce({ error: 'Error saving collection' });

      const response = await supertest(app)
        .post('/collection/createCollection')
        .send(mockCollection);

      expect(response.status).toBe(500);
    });
  });

  describe('GET /getCollectionsByUser/:username', () => {
    it('should return all collections of a user given correct arguments', async () => {
      getCollectionsByUserSpy.mockResolvedValueOnce([mockDatabaseCollection]);

      const response = await supertest(app).get(
        `/collection/getCollectionsByUser/${mockCollection.username}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockCollectionJSONResponse]);
      expect(getCollectionsByUserSpy).toHaveBeenCalledWith(mockCollection.username);
    });

    it('should return 404 for a missing username', async () => {
      const response = await supertest(app).get('//collection/getCollectionsByUser/');
      expect(response.status).toBe(404);
    });

    it('should return 500 for a database error', async () => {
      getCollectionsByUserSpy.mockResolvedValueOnce({ error: 'Error getting collections' });

      const response = await supertest(app).get(
        `/collection/getCollectionsByUser/${mockCollection.username}`,
      );

      expect(response.status).toBe(500);
    });
  });
});
