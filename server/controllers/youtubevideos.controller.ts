import express, { Request, Response, Router } from 'express';
import fetchYoutubeVideos from '../services/youtubevideos.service';

const youtubeController = () => {
  const router: Router = express.Router();

  /**
   * Retrieves YouTube videos based on the tags from the most recent question asked by a given user.
   *
   * @param req The HTTP request object, containing the askedBy parameter in the URL.
   * @param res The HTTP response object used to send back the list of YouTube videos.
   *
   * @returns A Promise that resolves to void.
   */
  const getYoutubeVideosRoute = async (req: Request, res: Response): Promise<void> => {
    try {
      const { askedBy } = req.params; // Get the user ID from the request parameters
      const videos = await fetchYoutubeVideos(askedBy);

      if ('error' in videos) {
        res.status(500).send('No YouTube videos found for these tags.');
        return;
      }

      res.json(videos); // Return the videos as JSON
    } catch (err) {
      res.status(500).send(`Error fetching YouTube videos: ${(err as Error).message}`);
    }
  };

  router.get('/getYoutubeVideos/:askedBy', getYoutubeVideosRoute);
  return router;
};

export default youtubeController;
