import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Answer,
  AddAnswerRequest,
  FakeSOSocket,
  PopulatedDatabaseAnswer,
  AnswerFeedRequest,
} from '../types/types';
import {
  addAnswerToQuestion,
  fetchAnswersByFollowing,
  saveAnswer,
} from '../services/answer.service';
import { populateDocument } from '../utils/database.util';
import { getUserByUsername } from '../services/user.service';
import { saveNotification } from '../services/notification.service';
import QuestionModel from '../models/questions.model';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isRequestValid(req: AddAnswerRequest): boolean {
    return !!req.body.qid && !!req.body.ans;
  }

  /**
   * Checks if the provided answer contains the required fields.
   *
   * @param ans The answer object to validate.
   *
   * @returns `true` if the answer is valid, otherwise `false`.
   */
  function isAnswerValid(ans: Answer): boolean {
    return !!ans.text && !!ans.ansBy && !!ans.ansDateTime;
  }

  /**
   * Adds a new answer to a question in the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addAnswer = async (req: AddAnswerRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }
    if (!isAnswerValid(req.body.ans)) {
      res.status(400).send('Invalid answer');
      return;
    }

    const { qid } = req.body;
    const ansInfo: Answer = req.body.ans;

    try {
      const ansFromDb = await saveAnswer(ansInfo);

      if ('error' in ansFromDb) {
        throw new Error(ansFromDb.error as string);
      }

      const status = await addAnswerToQuestion(qid, ansFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      const populatedAns = await populateDocument(ansFromDb._id.toString(), 'answer');

      if (populatedAns && 'error' in populatedAns) {
        throw new Error(populatedAns.error);
      }

      // send a notification to the question asker when this answer is added
      const question = await QuestionModel.findOne({ _id: qid });
      if (!question) {
        throw Error('Question not found');
      }
      const notification = await saveNotification({
        username: question.askedBy,
        text: `${ansFromDb.ansBy} answered your question: "${question.title}"`,
        seen: false,
        type: 'answer',
        link: `/question/${qid}`,
      });
      if ('error' in notification) {
        throw new Error(notification.error);
      }
      socket.emit('notificationUpdate', { notification, type: 'created' });
      socket.emit('storeUpdate', { type: 'addition', username: question.askedBy, count: 2 });
      // Populates the fields of the answer that was added and emits the new object
      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });
      res.json(ansFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  /**
   * Backend logic to return a feed of answers and answers that the given user is following, sorted by date
   */
  const getAnswerFeed = async (req: AnswerFeedRequest, res: Response): Promise<void> => {
    if (!req.params.username) {
      res.status(400).send('Invalid username');
    }

    try {
      const userResponse = await getUserByUsername(req.params.username);

      if ('error' in userResponse) {
        throw new Error(userResponse.error);
      }

      const { following } = userResponse;
      if (!following) {
        res.send([]);
        return;
      }

      const answers = await fetchAnswersByFollowing(following);

      if ('error' in answers) {
        throw new Error(answers.error);
      }

      res.json(answers);
    } catch (error) {
      res
        .status(500)
        .send(`Error when fetching answer feed by username: ${(error as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addAnswer', addAnswer);
  router.get('/getAnswerFeed/:username', getAnswerFeed);

  return router;
};

export default answerController;
