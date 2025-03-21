import supertest from 'supertest';
import { app } from '../../app';

import * as util from '../../services/youtubevideos.service';

const fetchYoutubeVideosSpy = jest.spyOn(util, 'fetchYoutubeVideos');

describe('Test youtubeController', () => {
  describe('GET /getYoutubeVideos/:askedBy', () => {
    it('should return videos when found', async () => {
      const mockVideos = [
        {
          title: 'Video1',
          url: 'http://youtube.com/1',
          thumbnail: 'http://youtube.com/thumbnail1.jpg',
          channelTitle: 'Channel1',
        },
        {
          title: 'Video2',
          url: 'http://youtube.com/2',
          thumbnail: 'http://youtube.com/thumbnail2.jpg',
          channelTitle: 'Channel2',
        },
      ];
      fetchYoutubeVideosSpy.mockResolvedValueOnce(mockVideos);

      const response = await supertest(app).get('/videos/getYoutubeVideos/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockVideos);
    });

    it('should return 500 if no videos are found', async () => {
      fetchYoutubeVideosSpy.mockResolvedValueOnce({
        error: 'No YouTube videos found for these tags.',
      });
      const response = await supertest(app).get('/videos/getYoutubeVideos/user123');
      expect(response.status).toBe(500);
      expect(response.text).toBe('No YouTube videos found for these tags.');
    });

    it('should return 500 if an error occurs', async () => {
      fetchYoutubeVideosSpy.mockRejectedValueOnce(new Error('Error fetching YouTube videos'));

      const response = await supertest(app).get('/videos/getYoutubeVideos/user123');

      expect(response.status).toBe(500);
      expect(response.text).toContain(
        'Error fetching YouTube videos: Error fetching YouTube videos',
      );
    });
  });
});
