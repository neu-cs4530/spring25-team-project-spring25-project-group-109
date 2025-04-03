import express, { Response } from 'express';
import { QuestionFeedRequest } from '../types/types';
import fetchQuestionsByFollowedActivity from '../services/feed.service';
import { getUserByUsername } from '../services/user.service';

const feedController = () => {
  const router = express.Router();

  const getPersonalizedFeed = async (req: QuestionFeedRequest, res: Response): Promise<void> => {
    const { username } = req.params;

    try {
      const user = await getUserByUsername(username);
      if ('error' in user) {
        throw new Error(user.error);
      }

      const { following } = user;
      if (!following || following.length === 0) {
        res.send([]);
        return;
      }

      const questions = await fetchQuestionsByFollowedActivity(following);
      if ('error' in questions) {
        throw new Error(questions.error);
      }

      res.status(200).json(questions);
    } catch (error) {
      res.status(500).send(`Error getting personalized feed: ${(error as Error).message}`);
    }
  };

  router.get('/getRecommendedFeed/:username', getPersonalizedFeed);
  return router;
};

export default feedController;
