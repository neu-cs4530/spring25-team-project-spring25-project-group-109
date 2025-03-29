import {
  Answer,
  AnswerResponse,
  DatabaseAnswer,
  DatabaseQuestion,
  DatabaseUser,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseComment,
  PopulatedDatabaseQuestion,
  QuestionResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import UserStatsModel from '../models/userstats.model';
import { updateCoins } from './store.service';
import UserModel from '../models/users.model';
import CommentModel from '../models/comments.model';

/**
 * Records the most recent answer time for a given question based on its answers.
 *
 * @param {PopulatedDatabaseQuestion} question - The question containing answers to check.
 * @param {Map<string, Date>} mp - A map storing the most recent answer time for each question.
 */
export const getMostRecentAnswerTime = (
  question: PopulatedDatabaseQuestion,
  mp: Map<string, Date>,
): void => {
  question.answers.forEach((answer: PopulatedDatabaseAnswer) => {
    const currentMostRecent = mp.get(question._id.toString());
    if (!currentMostRecent || currentMostRecent < answer.ansDateTime) {
      mp.set(question._id.toString(), answer.ansDateTime);
    }
  });
};

/**
 * Saves a new answer to the database.
 *
 * @param {Answer} answer - The answer object to be saved.
 * @returns {Promise<AnswerResponse>} - A promise resolving to the saved answer or an error message.
 */
export const saveAnswer = async (answer: Answer): Promise<AnswerResponse> => {
  try {
    const result: DatabaseAnswer = await AnswerModel.create(answer);
    await updateCoins(answer.ansBy, 1);

    return result;
  } catch (error) {
    return { error: 'Error when saving an answer' };
  }
};

/**
 * Adds an existing answer to a specified question in the database.
 *
 * @param {string} qid - The ID of the question to which the answer will be added.
 * @param {DatabaseAnswer} ans - The answer to associate with the question.
 * @returns {Promise<QuestionResponse>} - A promise resolving to the updated question or an error message.
 */
export const addAnswerToQuestion = async (
  qid: string,
  ans: DatabaseAnswer,
): Promise<QuestionResponse> => {
  try {
    if (!ans || !ans.text || !ans.ansBy || !ans.ansDateTime) {
      throw new Error('Invalid answer');
    }

    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [ans._id], $position: 0 } } },
      { new: true },
    );

    if (result === null) {
      throw new Error('Error when adding answer to question');
    }
    const userStats = await UserStatsModel.findOneAndUpdate(
      { username: ans.ansBy },
      { $inc: { answersCount: 1 } },
      { new: true },
    );
    if (!userStats) {
      throw new Error('Error updating user stats');
    }

    return result;
  } catch (error) {
    return { error: 'Error when adding answer to question' };
  }
};

/**
 * Gather all the answers of the users that the user is following.
 */

export const fetchAnswersByFollowing = async (
  following: string[],
): Promise<PopulatedDatabaseAnswer[] | { error: string }> => {
  try {
    const answers = await AnswerModel.find({ ansBy: { $in: following } })
      .populate<{
        comments: PopulatedDatabaseComment[];
        ansBy: DatabaseUser;
      }>([
        {
          path: 'comments',
          model: CommentModel,
          populate: {
            path: 'commentBy',
            model: UserModel,
            localField: 'commentBy',
            foreignField: 'username',
          },
        },
        { path: 'ansBy', model: UserModel, localField: 'ansBy', foreignField: 'username' },
      ])
      .sort({ ansDateTime: -1 });

    if (!answers) {
      return [];
    }

    return answers;
  } catch (error) {
    return { error: 'Error when fetching answers by following!' };
  }
};
