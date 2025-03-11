import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as util from '../../services/currency.service';
import { DatabaseCurrency } from '../../types/types';

const mockUnlockRequestBody = {
  username: 'user1',
  feature: 'nim',
  cost: 10,
};

const mockCreateCurrencyRequestBody = {
  username: 'user1',
  coinCount: 0,
  customPhoto: false,
  nim: false,
};

const mockDatabaseCurrency: DatabaseCurrency = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  coinCount: 0,
  customPhoto: false,
  nim: false,
};

const mockCurrencyJSONResponse = {
  _id: mockDatabaseCurrency._id.toString(),
  username: 'user1',
  coinCount: 0,
  customPhoto: false,
  nim: false,
};

const saveCurrencySpy = jest.spyOn(util, 'saveCurrency');
const getCurrencySpy = jest.spyOn(util, 'getCurrency');
const unlockFeatureSpy = jest.spyOn(util, 'unlockFeature');

describe('POST /createCurrency', () => {
  it('should create a currency object given correct arguments', async () => {
    saveCurrencySpy.mockResolvedValueOnce({ ...mockDatabaseCurrency });

    const response = await supertest(app)
      .post('/currency/createCurrency')
      .send(mockCreateCurrencyRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockCurrencyJSONResponse });
    expect(saveCurrencySpy).toHaveBeenCalledWith(mockCreateCurrencyRequestBody);
  });

  it('should return 400 for a missing name', async () => {
    const mockIncompleteReqBody = {
      coinCount: 0,
      customPhoto: false,
      nim: false,
    };

    const response = await supertest(app)
      .post('/currency/createCurrency')
      .send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid currency creation request');
  });

  it('should return 500 for an error', async () => {
    saveCurrencySpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app)
      .post('/currency/createCurrency')
      .send(mockCreateCurrencyRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error saving currency: Test error');
  });
});

describe('GET /getCurrencyByUser', () => {
  it('should return a currency object given a valid username', async () => {
    getCurrencySpy.mockResolvedValueOnce({ ...mockDatabaseCurrency });

    const response = await supertest(app).get(
      `/currency/getCurrencyByUser/${mockDatabaseCurrency.username}`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockCurrencyJSONResponse });
    expect(getCurrencySpy).toHaveBeenCalledWith(mockDatabaseCurrency.username);
  });

  it('should return 500 for an error', async () => {
    getCurrencySpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app).get(
      `/currency/getCurrencyByUser/${mockDatabaseCurrency.username}`,
    );

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error fetching currency: Test error');
  });

  it('should return 404 for a missing username', async () => {
    const response = await supertest(app).get('/currency/getCurrencyByUser/');
    expect(response.status).toBe(404);
  });
});

describe('POST /unlockFeature', () => {
  it('should unlock a feature given correct arguments', async () => {
    unlockFeatureSpy.mockResolvedValueOnce({ ...mockDatabaseCurrency });

    const response = await supertest(app)
      .post('/currency/unlockFeature')
      .send(mockUnlockRequestBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ...mockCurrencyJSONResponse });
    expect(unlockFeatureSpy).toHaveBeenCalledWith(
      mockUnlockRequestBody.username,
      mockUnlockRequestBody.feature,
      mockUnlockRequestBody.cost,
    );
  });

  it('should return 400 for a missing name', async () => {
    const mockIncompleteReqBody = {
      feature: 'nim',
      cost: 10,
    };

    const response = await supertest(app)
      .post('/currency/unlockFeature')
      .send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid unlock feature request');
  });

  it('should return 400 for missing feature', async () => {
    const mockIncompleteReqBody = {
      username: 'user1',
      cost: 10,
    };

    const response = await supertest(app)
      .post('/currency/unlockFeature')
      .send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid unlock feature request');
  });

  it('should return 400 for missing cost', async () => {
    const mockIncompleteReqBody = {
      username: 'user1',
      feature: 'nim',
    };
    const response = await supertest(app)
      .post('/currency/unlockFeature')
      .send(mockIncompleteReqBody);
    expect(response.status).toBe(400);
    expect(response.text).toEqual('Invalid unlock feature request');
  });

  it('should return 500 for an error', async () => {
    unlockFeatureSpy.mockRejectedValueOnce(new Error('Test error'));

    const response = await supertest(app)
      .post('/currency/unlockFeature')
      .send(mockUnlockRequestBody);

    expect(response.status).toBe(500);
    expect(response.text).toEqual('Error unlocking feature: Test error');
  });
});
