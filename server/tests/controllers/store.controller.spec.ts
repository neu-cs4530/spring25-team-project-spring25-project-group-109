import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/store.service';
import { mockDatabaseStore, mockStoreJSONResponse } from '../mockData.models';

const mockUnlockRequestBody = {
  username: 'user1',
  featureName: 'Nim',
};

const mockCreateStoreRequestBody = {
  username: 'user1',
  coinCount: 0,
  unlockedFeatures: [],
};

const saveStoreSpy = jest.spyOn(util, 'saveStore');
const getStoreSpy = jest.spyOn(util, 'getStore');
const unlockFeatureSpy = jest.spyOn(util, 'unlockFeature');

describe('POST /createStore', () => {
  it('should create a store object given correct arguments', async () => {
    saveStoreSpy.mockResolvedValueOnce({ ...mockDatabaseStore });

    const response = await supertest(app)
      .post('/store/createStore')
      .send(mockCreateStoreRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockStoreJSONResponse });
    expect(saveStoreSpy).toHaveBeenCalledWith(mockCreateStoreRequestBody);
  });

  it('should return 400 for a missing name', async () => {
    const mockIncompleteReqBody = {
      coinCount: 0,
      customPhoto: false,
      nim: false,
    };

    const response = await supertest(app).post('/store/createStore').send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid store creation request');
  });

  it('should return 500 for an error', async () => {
    saveStoreSpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app)
      .post('/store/createStore')
      .send(mockCreateStoreRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error saving store: Test error');
  });
});

describe('GET /getStoreByUser', () => {
  it('should return a store object given a valid username', async () => {
    getStoreSpy.mockResolvedValueOnce({ ...mockDatabaseStore });

    const response = await supertest(app).get(
      `/store/getStoreByUser/${mockDatabaseStore.username}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockStoreJSONResponse });
    expect(getStoreSpy).toHaveBeenCalledWith(mockDatabaseStore.username);
  });

  it('should return 500 for an error', async () => {
    getStoreSpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app).get(
      `/store/getStoreByUser/${mockDatabaseStore.username}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error fetching store: Test error');
  });

  it('should return 404 for a missing username', async () => {
    const response = await supertest(app).get('/store/getStoreByUser/');
    expect(response.status).toBe(404);
  });
});

describe('POST /unlockFeature', () => {
  it('should unlock a feature given correct arguments', async () => {
    unlockFeatureSpy.mockResolvedValueOnce({ ...mockDatabaseStore });

    const response = await supertest(app).patch('/store/unlockFeature').send(mockUnlockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockStoreJSONResponse });
    expect(unlockFeatureSpy).toHaveBeenCalledWith(
      mockUnlockRequestBody.username,
      mockUnlockRequestBody.featureName,
    );
  });

  it('should return 400 for a missing name', async () => {
    const mockIncompleteReqBody = {
      featureName: 'Nim',
    };

    const response = await supertest(app).patch('/store/unlockFeature').send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid unlock feature request');
  });

  it('should return 400 for missing feature name', async () => {
    const mockIncompleteReqBody = {
      username: 'user1',
    };

    const response = await supertest(app).patch('/store/unlockFeature').send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid unlock feature request');
  });

  it('should return 500 for an error', async () => {
    unlockFeatureSpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app).patch('/store/unlockFeature').send(mockUnlockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error unlocking feature: Test error');
  });
});
