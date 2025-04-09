import supertest from 'supertest';
import { app } from '../../app';
import * as util from '../../services/feature.service';
import { mockFeature, mockFeatureJSONResponse } from '../mockData.models';

const getFeaturesListSpy = jest.spyOn(util, 'default');

describe('Test feature controller', () => {
  describe('GET /getFeatures', () => {
    it('should return the features from the database', async () => {
      getFeaturesListSpy.mockResolvedValueOnce([mockFeature]);

      const response = await supertest(app).get(`/features/getFeatures`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockFeatureJSONResponse]);
      expect(getFeaturesListSpy).toHaveBeenCalled();
    });

    it('should return 500 if database error while finding features', async () => {
      getFeaturesListSpy.mockResolvedValueOnce({ error: 'Error finding features' });

      const response = await supertest(app).get(`/features/getFeatures`);

      expect(response.status).toBe(500);
    });

    it('should return 500 if database throws error while finding features', async () => {
      getFeaturesListSpy.mockRejectedValueOnce(new Error('error'));

      const response = await supertest(app).get(`/features/getFeatures`);

      expect(response.status).toBe(500);
    });
  });
});
