import supertest from 'supertest';
import { app } from '../../app';
import { badge, dbBadge, user } from '../mockData.models';
import * as util from '../../services/badge.service';

const saveBadgeSpy = jest.spyOn(util, 'saveBadge');
const getBadgeSpy = jest.spyOn(util, 'getBadgesList');
const checkAndAwardBadgesSpy = jest.spyOn(util, 'checkAndAwardBadges');

const mockBadgeJSONResponse = {
  ...dbBadge,
  _id: dbBadge._id.toString(),
};

describe('Test userController', () => {
  describe('POST /addBadge', () => {
    it('should create a new badge given correct arguments', async () => {
      const mockReqBody = badge;

      saveBadgeSpy.mockResolvedValueOnce(dbBadge);

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBadgeJSONResponse);
      expect(saveBadgeSpy).toHaveBeenCalledWith({
        description: 'Asked 5 Questions',
        imagePath: 'imagePath',
        name: 'Inquisitive',
        threshold: 5,
        type: 'question',
      });
    });
    it('should return 400 for request missing description', async () => {
      const mockReqBody = {
        name: 'badge',
        type: 'question',
        threshold: 10,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request with empty description', async () => {
      const mockReqBody = {
        name: 'badge',
        description: '',
        type: 'question',
        threshold: 10,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request missing name', async () => {
      const mockReqBody = {
        description: 'description',
        type: 'question',
        threshold: 10,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request with empty name', async () => {
      const mockReqBody = {
        name: '',
        description: 'description',
        type: 'question',
        threshold: 10,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request missing threshold', async () => {
      const mockReqBody = {
        name: 'badge',
        description: 'description',
        type: 'question',
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request with a threshold of 0', async () => {
      const mockReqBody = {
        name: 'badge',
        description: 'description',
        type: 'question',
        threshold: 0,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request missing type', async () => {
      const mockReqBody = {
        name: 'badge',
        description: 'description',
        threshold: 10,
        imagePath: 'img',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request missing imagePath', async () => {
      const mockReqBody = {
        name: 'badge',
        description: 'description',
        threshold: 10,
        type: 'question',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 400 for request with empty imagePath', async () => {
      const mockReqBody = {
        name: 'badge',
        description: 'description',
        threshold: 10,
        type: 'question',
        imagePath: '',
      };

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toEqual('Invalid badge body');
    });
    it('should return 500 for a database error while saving badge', async () => {
      const mockReqBody = badge;

      saveBadgeSpy.mockResolvedValueOnce({ error: 'Error saving badge' });

      const response = await supertest(app).post('/badge/addBadge').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });
  describe('GET /getBadges', () => {
    it('should return the users from the database', async () => {
      getBadgeSpy.mockResolvedValueOnce([dbBadge]);

      const response = await supertest(app).get(`/badge/getBadges`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockBadgeJSONResponse]);
      expect(getBadgeSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding users', async () => {
      getBadgeSpy.mockResolvedValueOnce({ error: 'Error finding users' });

      const response = await supertest(app).get(`/badge/getBadges`);

      expect(response.status).toBe(500);
    });
  });
  describe('PATCH /getBadges', () => {
    it('should return the users updated badges', async () => {
      checkAndAwardBadgesSpy.mockResolvedValueOnce([dbBadge]);

      const response = await supertest(app).patch(`/badge/updateBadges/${user.username}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ badges: [mockBadgeJSONResponse] });
      expect(checkAndAwardBadgesSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while updating badges', async () => {
      checkAndAwardBadgesSpy.mockResolvedValueOnce({ error: 'Error finding users' });
      const response = await supertest(app).patch(`/badge/updateBadges/${user.username}`);

      expect(response.status).toBe(500);
    });

    it('should return 404 if username not found', async () => {
      const response = await supertest(app).put(`/badge/updateBadges`);

      expect(response.status).toBe(404);
    });
  });
});
