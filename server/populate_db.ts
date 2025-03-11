import mongoose, { ObjectId } from 'mongoose';
import AnswerModel from './models/answers.model';
import QuestionModel from './models/questions.model';
import TagModel from './models/tags.model';
import CommentModel from './models/comments.model';
import UserModel from './models/users.model';
import CollectionModel from './models/collections.model';
import UserStatsModel from './models/userstats.model';
import {
  Answer,
  Collection,
  Comment,
  DatabaseAnswer,
  DatabaseCollection,
  DatabaseComment,
  DatabaseQuestion,
  DatabaseTag,
  DatabaseUser,
  Question,
  Tag,
  User,
  UserStats,
} from './types/types';
import {
  Q1_DESC,
  Q1_TXT,
  A1_TXT,
  A2_TXT,
  T1_NAME,
  T1_DESC,
  T2_NAME,
  T2_DESC,
  T3_NAME,
  T3_DESC,
  T4_NAME,
  T4_DESC,
  T5_NAME,
  T5_DESC,
  T6_NAME,
  T6_DESC,
  C1_TEXT,
  C2_TEXT,
  C3_TEXT,
} from './data/posts_strings';

// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
const userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
  throw new Error('ERROR: You need to specify a valid mongodb URL as the first argument');
}

const mongoDB = userArgs[0];
mongoose.connect(mongoDB);
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/**
 * Creates a new Tag document in the database.
 *
 * @param name The name of the tag.
 * @param description The description of the tag.
 * @returns A Promise that resolves to the created Tag document.
 * @throws An error if the name is empty.
 */
async function tagCreate(name: string, description: string): Promise<DatabaseTag> {
  if (name === '') throw new Error('Invalid Tag Format');
  const tag: Tag = { name: name, description: description };
  return await TagModel.create(tag);
}

/**
 * Creates a new Comment document in the database.
 *
 * @param text The content of the comment.
 * @param commentBy The username of the user who commented.
 * @param commentDateTime The date and time when the comment was posted.
 * @returns A Promise that resolves to the created Comment document.
 * @throws An error if any of the parameters are invalid.
 */
async function commentCreate(
  text: string,
  commentBy: string,
  commentDateTime: Date,
): Promise<DatabaseComment> {
  if (text === '' || commentBy === '' || commentDateTime == null)
    throw new Error('Invalid Comment Format');
  const commentDetail: Comment = {
    text: text,
    commentBy: commentBy,
    commentDateTime: commentDateTime,
  };
  return await CommentModel.create(commentDetail);
}

/**
 * Creates a new Answer document in the database.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the user who wrote the answer.
 * @param ansDateTime The date and time when the answer was created.
 * @param comments The comments that have been added to the answer.
 * @returns A Promise that resolves to the created Answer document.
 * @throws An error if any of the parameters are invalid.
 */
async function answerCreate(
  text: string,
  ansBy: string,
  ansDateTime: Date,
  comments: Comment[],
): Promise<DatabaseAnswer> {
  if (text === '' || ansBy === '' || ansDateTime == null || comments == null)
    throw new Error('Invalid Answer Format');
  const answerDetail: Answer = {
    text: text,
    ansBy: ansBy,
    ansDateTime: ansDateTime,
    comments: comments,
  };
  return await AnswerModel.create(answerDetail);
}

/**
 * Creates a new Question document in the database.
 *
 * @param title The title of the question.
 * @param text The content of the question.
 * @param tags An array of tags associated with the question.
 * @param answers An array of answers associated with the question.
 * @param askedBy The username of the user who asked the question.
 * @param askDateTime The date and time when the question was asked.
 * @param views An array of usernames who have viewed the question.
 * @param comments An array of comments associated with the question.
 * @returns A Promise that resolves to the created Question document.
 * @throws An error if any of the parameters are invalid.
 */
async function questionCreate(
  title: string,
  text: string,
  tags: DatabaseTag[],
  answers: DatabaseAnswer[],
  askedBy: string,
  askDateTime: Date,
  views: string[],
  comments: Comment[],
): Promise<DatabaseQuestion> {
  if (
    title === '' ||
    text === '' ||
    tags.length === 0 ||
    askedBy === '' ||
    askDateTime == null ||
    comments == null
  )
    throw new Error('Invalid Question Format');
  return await QuestionModel.create({
    title: title,
    text: text,
    tags: tags,
    askedBy: askedBy,
    answers: answers,
    views: views,
    askDateTime: askDateTime,
    upVotes: [],
    downVotes: [],
    comments: comments,
  });
}

async function userCreate(
  username: string,
  password: string,
  dateJoined: Date,
  biography?: string,
): Promise<DatabaseUser> {
  if (username === '' || password === '' || dateJoined === null) {
    throw new Error('Invalid User Format');
  }

  const userDetail: User = {
    username,
    password,
    dateJoined,
    biography: biography ?? '',
  };

  const user = await UserModel.create(userDetail);
  
  const userStats: UserStats = {
    userId: user._id,
    answersCount: 0,
    commentsCount: 0,
    nimWinCount: 0,
    questionsCount: 0,
  };

  await UserStatsModel.create(userStats);
  return user;
}

async function collectionCreate(
  name: string,
  username: string,
  visibility: 'public' | 'private',
  questions: mongoose.Types.ObjectId[],
): Promise<DatabaseCollection> {
  if (!name || !username) throw new Error('Invalid Collection Format');
  const collection: Collection = { name, username, visibility, questions };
  return await CollectionModel.create(collection);
}

/**
 * Populates the database with predefined data.
 * Logs the status of the operation to the console.
 */
const populate = async () => {
  try {
    await userCreate(
      'sama',
      'sama',
      new Date('2023-12-11T03:30:00'),
      'I am a student.',
    );
    await userCreate(
      'kyle',
      'kyle',
      new Date('2022-12-11T03:30:00'),
      'I am a software engineer.',
    );
    await userCreate(
      'nitsa',
      'nitsa',
      new Date('2023-12-11T03:30:00'),
      'I am a designer.',
    );
    await userCreate(
      'annabelle',
      'annabelle',
      new Date('2022-12-11T03:30:00'),
      'I am a manager.',
    );

    const t1 = await tagCreate(T1_NAME, T1_DESC);
    const t2 = await tagCreate(T2_NAME, T2_DESC);
    const t3 = await tagCreate(T3_NAME, T3_DESC);
    const t4 = await tagCreate(T4_NAME, T4_DESC);
    const t5 = await tagCreate(T5_NAME, T5_DESC);
    const t6 = await tagCreate(T6_NAME, T6_DESC);

    const c1 = await commentCreate(C1_TEXT, 'sama', new Date('2023-12-12T03:30:00'));
    const c2 = await commentCreate(C2_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));
    const c3 = await commentCreate(C3_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));

    const a1 = await answerCreate(A1_TXT, 'annabelle', new Date('2023-11-20T03:24:42'), [c1]);
    const a2 = await answerCreate(A2_TXT, 'kyle', new Date('2023-11-23T08:24:00'), [c2]);

    const q1 = await questionCreate(
      Q1_DESC,
      Q1_TXT,
      [t1, t2],
      [a1, a2],
      'sama',
      new Date('2022-01-20T03:00:00'),
      ['annabelle', 'kyle'],
      [c3],
    );

    await collectionCreate('favorites', 'nitsa', 'private', [q1._id]);
    await collectionCreate('typescript', 'annabelle', 'public', []);

    console.log('Database populated');
  } catch (err) {
    console.log('ERROR: ' + err);
  } finally {
    if (db) db.close();
    console.log('done');
  }
};

populate();

console.log('Processing ...');
