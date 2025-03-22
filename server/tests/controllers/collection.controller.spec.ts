import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/collection.service';
import { DatabaseCollection, Collection } from '../../types/types';
import { populateDocument } from '../../utils/database.util';

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

jest.mock('../../utils/database.util', () => ({
  populateDocument: jest.fn(),
}));

const saveCollectionSpy = jest.spyOn(util, 'saveCollection');
const getCollectionsByUserSpy = jest.spyOn(util, 'getCollectionsByUser');
const deleteCollectionSpy = jest.spyOn(util, 'deleteCollection');
const updateCollectionSpy = jest.spyOn(util, 'updateCollection');
const addQuestionToCollectionSpy = jest.spyOn(util, 'addQuestionToCollection');
const removeQuestionFromCollectionSpy = jest.spyOn(util, 'removeQuestionFromCollection');

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

    it('should return collections with populated questions', async () => {
      const questionId = new mongoose.Types.ObjectId();
      const populatedQuestion = {
        _id: questionId,
        title: 'What is TypeScript?',
        content: 'How do I learn TypeScript effectively?',
        postedBy: 'user123',
        createdAt: new Date(),
        views: 100,
        answers: 5,
      };

      const collectionWithQuestion: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(),
        name: 'favorites',
        username: 'user1',
        questions: [questionId],
        visibility: 'public',
      };

      getCollectionsByUserSpy.mockResolvedValueOnce([collectionWithQuestion]);
      (populateDocument as jest.Mock).mockResolvedValue(populatedQuestion);

      const response = await supertest(app).get(`/collection/getCollectionsByUser/user1`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);

      const returnedCollection = response.body[0];
      expect(returnedCollection.questions).toHaveLength(1);
      expect(returnedCollection.questions[0]).toMatchObject({
        title: populatedQuestion.title,
        content: populatedQuestion.content,
        postedBy: populatedQuestion.postedBy,
        views: populatedQuestion.views,
        answers: populatedQuestion.answers,
      });

      expect(populateDocument).toHaveBeenCalledWith(questionId, 'question');
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

  describe('DELETE /deleteCollection/:id', () => {
    it('should delete a collection given correct arguments', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const existingCollection: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(collectionId),
        name: 'favorites',
        username: 'user1',
        questions: [],
        visibility: 'public',
      };

      deleteCollectionSpy.mockResolvedValueOnce(existingCollection);

      const response = await supertest(app).delete(`/collection/deleteCollection/${collectionId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: existingCollection._id.toString(),
        name: existingCollection.name,
        username: existingCollection.username,
        questions: existingCollection.questions,
        visibility: existingCollection.visibility,
      });
    });

    it('should return 404 for a missing collection ID', async () => {
      const response = await supertest(app).delete(`/collection/deleteCollection/`);

      expect(response.status).toBe(404);
    });

    it('should return 500 for a database error', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      deleteCollectionSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).delete(`/collection/deleteCollection/${collectionId}`);

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /updateCollectionVisibility/:id', () => {
    it('should update the collection visibility given correct arguments', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updatedCollection: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(collectionId),
        name: 'favorites',
        username: 'user1',
        questions: [],
        visibility: 'private',
      };

      updateCollectionSpy.mockResolvedValueOnce(updatedCollection);

      const response = await supertest(app)
        .patch(`/collection/updateCollectionVisibility/${collectionId}`)
        .send({ visibility: 'private' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedCollection._id.toString(),
        name: updatedCollection.name,
        username: updatedCollection.username,
        questions: updatedCollection.questions,
        visibility: updatedCollection.visibility,
      });
    });

    it('should return 404 for a missing collection ID', async () => {
      const response = await supertest(app)
        .patch(`/collection/updateCollectionVisibility/`)
        .send({ visibility: 'private' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid visibility update request', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      const response = await supertest(app)
        .patch(`/collection/updateCollectionVisibility/${collectionId}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 500 for a database error', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      updateCollectionSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app)
        .patch(`/collection/updateCollectionVisibility/${collectionId}`)
        .send({ visibility: 'private' });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /updateCollectionName/:id', () => {
    it('should update the collection name given correct arguments', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updatedCollection: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(collectionId),
        name: 'updatedFavorites',
        username: 'user1',
        questions: [],
        visibility: 'public',
      };

      updateCollectionSpy.mockResolvedValueOnce(updatedCollection);

      const response = await supertest(app)
        .patch(`/collection/updateCollectionName/${collectionId}`)
        .send({ name: 'updatedFavorites' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedCollection._id.toString(),
        name: updatedCollection.name,
        username: updatedCollection.username,
        questions: updatedCollection.questions,
        visibility: updatedCollection.visibility,
      });
    });

    it('should return 404 for a missing collection ID', async () => {
      const response = await supertest(app)
        .patch(`/collection/updateCollectionName/`)
        .send({ name: 'updatedFavorites' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid name update request', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      const response = await supertest(app)
        .patch(`/collection/updateCollectionName/${collectionId}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 500 for a database error', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      updateCollectionSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app)
        .patch(`/collection/updateCollectionName/${collectionId}`)
        .send({ name: 'updatedFavorites' });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /addQuestion/:id', () => {
    it('should add a question to the collection given correct arguments', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updatedCollection: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(collectionId),
        name: 'favorites',
        username: 'user1',
        questions: [new mongoose.Types.ObjectId()],
        visibility: 'public',
      };

      addQuestionToCollectionSpy.mockResolvedValueOnce(updatedCollection);

      const response = await supertest(app)
        .patch(`/collection/addQuestion/${collectionId}`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedCollection._id.toString(),
        name: updatedCollection.name,
        username: updatedCollection.username,
        questions: updatedCollection.questions.map(q => q.toString()),
        visibility: updatedCollection.visibility,
      });
    });

    it('should return 404 for a missing collection ID', async () => {
      const response = await supertest(app)
        .patch(`/collection/addQuestion/`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid question ID update request', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      const response = await supertest(app)
        .patch(`/collection/addQuestion/${collectionId}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 500 for a database error', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      addQuestionToCollectionSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app)
        .patch(`/collection/addQuestion/${collectionId}`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /removeQuestion/:id', () => {
    it('should remove a question from the collection given correct arguments', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();
      const updatedCollection: DatabaseCollection = {
        _id: new mongoose.Types.ObjectId(collectionId),
        name: 'favorites',
        username: 'user1',
        questions: [],
        visibility: 'public',
      };

      removeQuestionFromCollectionSpy.mockResolvedValueOnce(updatedCollection);

      const response = await supertest(app)
        .patch(`/collection/removeQuestion/${collectionId}`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: updatedCollection._id.toString(),
        name: updatedCollection.name,
        username: updatedCollection.username,
        questions: updatedCollection.questions.map(q => q.toString()),
        visibility: updatedCollection.visibility,
      });
    });

    it('should return 404 for a missing collection ID', async () => {
      const response = await supertest(app)
        .patch(`/collection/removeQuestion/`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(404);
    });

    it('should return 400 for an invalid question ID update request', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      const response = await supertest(app)
        .patch(`/collection/removeQuestion/${collectionId}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 500 for a database error', async () => {
      const collectionId = new mongoose.Types.ObjectId().toString();

      removeQuestionFromCollectionSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app)
        .patch(`/collection/removeQuestion/${collectionId}`)
        .send({ questionId: new mongoose.Types.ObjectId() });

      expect(response.status).toBe(500);
    });
  });
});
