import QuestionModel from '../models/questions.model';
import AnswerModel from '../models/answers.model';
import UserModel from '../models/users.model';
import CommentModel from '../models/comments.model';
import TagModel from '../models/tags.model';
import {
  PopulatedDatabaseAnswer,
  PopulatedDatabaseComment,
  DatabaseTag,
  DatabaseUser,
  PopulatedFeedQuestion,
} from '../types/types';

const fetchQuestionsByFollowedActivity = async (
  following: string[],
): Promise<PopulatedFeedQuestion[] | { error: string }> => {
  try {
    const questions = await QuestionModel.find({
      $or: [{ askedBy: { $in: following } }, { upVotes: { $in: following } }],
    })
      .populate<{
        tags: DatabaseTag[];
        answers: PopulatedDatabaseAnswer[];
        comments: PopulatedDatabaseComment[];
        askedBy: DatabaseUser;
      }>([
        { path: 'tags', model: TagModel },
        {
          path: 'answers',
          model: AnswerModel,
          populate: [
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
          ],
        },
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
        { path: 'askedBy', model: UserModel, localField: 'askedBy', foreignField: 'username' },
      ])
      .sort({ askDateTime: -1 });

    const questionsWithReason: PopulatedFeedQuestion[] = questions.map(q => {
      const feedReasons: ('askedByFollowed' | 'upvotedByFollowed')[] = [];
      if (following.includes(q.askedBy.username)) feedReasons.push('askedByFollowed');
      const followedUpvoters = q.upVotes.filter(username => following.includes(username));
      if (followedUpvoters.length > 0) feedReasons.push('upvotedByFollowed');

      return {
        ...q.toObject(),
        feedReasons,
        followedUpvoters,
      };
    });

    return questionsWithReason;
  } catch (error) {
    return { error: 'Error fetching questions by followed activity' };
  }
};

export default fetchQuestionsByFollowedActivity;
