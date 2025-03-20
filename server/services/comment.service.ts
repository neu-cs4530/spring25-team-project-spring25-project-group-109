import {
  AnswerResponse,
  Comment,
  CommentResponse,
  DatabaseAnswer,
  DatabaseComment,
  DatabaseQuestion,
  QuestionResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import CommentModel from '../models/comments.model';
import UserStatsModel from '../models/userstats.model';
import { saveNotification } from './notification.service';

/**
 * Saves a new comment to the database.
 * @param {Comment} comment - The comment to save.
 * @returns {Promise<CommentResponse>} - The saved comment or an error message.
 */
export const saveComment = async (comment: Comment): Promise<CommentResponse> => {
  try {
    const result: DatabaseComment = await CommentModel.create(comment);
    return result;
  } catch (error) {
    return { error: 'Error when saving a comment' };
  }
};

/**
 * Adds a comment to a question or answer.
 * @param {string} id - The ID of the question or answer.
 * @param {'question' | 'answer'} type - The type of the item to comment on.
 * @param {DatabaseComment} comment - The comment to add.
 * @returns {Promise<QuestionResponse | AnswerResponse>} - The updated item or an error message.
 */
export const addComment = async (
  id: string,
  type: 'question' | 'answer',
  comment: DatabaseComment,
): Promise<QuestionResponse | AnswerResponse> => {
  try {
    if (!comment || !comment.text || !comment.commentBy || !comment.commentDateTime) {
      throw new Error('Invalid comment');
    }

    let result: DatabaseQuestion | DatabaseAnswer | null;

    if (type === 'question') {
      result = await QuestionModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    } else {
      result = await AnswerModel.findOneAndUpdate(
        { _id: id },
        { $push: { comments: { $each: [comment._id] } } },
        { new: true },
      );
    }

    if (result === null) {
      throw new Error('Failed to add comment');
    }

    const userStats = await UserStatsModel.findOneAndUpdate(
      { username: comment.commentBy },
      { $inc: { commentsCount: 1 } },
      { new: true },
    );
    if (!userStats) {
      throw new Error('Error updating user stats');
    }

    if (type === 'question') {
      result = result as DatabaseQuestion;
      // send a notification to the question asker when this comment is added
      await saveNotification({
        username: result.askedBy,
        text: `${comment.commentBy} commented on your question: ${result.title}`,
        seen: false,
        type: 'comment',
      });
    } else {
      result = result as DatabaseAnswer;
      // send a notification to the answer poster when this comment is added
      await saveNotification({
        username: result.ansBy,
        text: `${comment.commentBy} commented on your answer!`,
        seen: false,
        type: 'comment',
      });
    }

    return result;
  } catch (error) {
    return { error: `Error when adding comment: ${(error as Error).message}` };
  }
};
