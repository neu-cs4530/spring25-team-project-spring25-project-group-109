import mongoose, { ObjectId } from 'mongoose';
import AnswerModel from './models/answers.model';
import QuestionModel from './models/questions.model';
import TagModel from './models/tags.model';
import CollectionModel from './models/collections.model';
import UserStatsModel from './models/userstats.model';
import {
  Answer,
  Badge,
  Collection,
  Comment,
  DatabaseAnswer,
  DatabaseCollection,
  DatabaseComment,
  DatabaseQuestion,
  DatabaseBadge,
  DatabaseTag,
  DatabaseUser,
  Tag,
  User,
  UserStats,
  BadgeType,
  Store,
  Feature,
  DatabaseFeature,
  FeatureType,
} from './types/types';
import * as strings from './data/posts_strings';
import CommentModel from './models/comments.model';
import UserModel from './models/users.model';
import BadgeModel from './models/badge.model';
import StoreModel from './models/store.model';
import FeatureModel from './models/feature.model';

// Pass URL of your mongoDB instance as first argument(e.g., mongodb://127.0.0.1:27017/fake_so)
const userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
  throw new Error('ERROR: You need to specify a valid mongodb URL as the first argument');
}

const mongoDB = userArgs[0];
// const mongoDB = 'mongodb+srv://goldk:JNxme1fST4ICsoPq@db-cs4530-spring25-109.sn9ik.mongodb.net/?retryWrites=true&w=majority&appName=db-cs4530-spring25-109';
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

/**
 * Creates a new Feature document in the database.
 *
 * @param name The name of the feature.
 * @param description The description of the feature.
 * @param price The price of the feature in coins.
 * @param imagePath (optional) The image path associated with the feature (if applicable).
 * @returns A Promise that resolves to the created Feature document.
 */
async function featureCreate(
  name: FeatureType,
  price: number,
): Promise<DatabaseFeature> {
  if (name === null || price <= 0) {
    throw new Error('Invalid Feature Format');
  }

  const feature: Feature = {
    name: name,
    price: price,
  };
  return await FeatureModel.create(feature);
}

/**
 * Creates a new Badge document in the database.
 *
 * @param name The name of the badge.
 * @param description The description of the badge.
 * @returns A Promise that resolves to the created Badge document.
 */
async function badgeCreate(
  name: string,
  description: string,
  type: BadgeType,
  threshold: number,
  imagePath: string,
): Promise<DatabaseBadge> {
  
  if (name === '' || description === '' || imagePath === '' || type === null || threshold === 0) {
    throw new Error('Invalid Badge Format');
  }
  const badge: Badge = {
    name: name,
    description: description,
    type: type,
    threshold: threshold,
    imagePath: imagePath,
  };
  return await BadgeModel.create(badge);
}

async function userCreate(
  username: string,
  password: string,
  dateJoined: Date,
  biography?: string,
  following?: string[],
): Promise<DatabaseUser> {
  if (username === '' || password === '' || dateJoined === null) {
    throw new Error('Invalid User Format');
  }

  const userDetail: User = {
    username,
    password,
    dateJoined,
    biography: biography ?? '',
    following: following ?? [],
    badgesEarned: [],
  };

  const user = await UserModel.create(userDetail);

  const userStats: UserStats = {
    username: user.username,
    answersCount: 0,
    commentsCount: 0,
    nimWinCount: 0,
    questionsCount: 0,
  };
  await UserStatsModel.create(userStats);

  const userStore: Store = {
    username: user.username,
    coinCount: 0,
    unlockedFeatures: []
  };
  await StoreModel.create(userStore);
  
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
    await featureCreate("Nim", 5);
    await featureCreate("Custom Photo", 10);
    
    await badgeCreate(strings.BQ1_NAME, strings.BQ1_DESCRIPTION, 'question', 1, `/images/badges/question/1.png`);
    await badgeCreate(strings.BQ10_NAME, strings.BQ10_DESCRIPTION, 'question', 10, `/images/badges/question/10.png`);
    await badgeCreate(strings.BQ50_NAME, strings.BQ50_DESCRIPTION, 'question', 50, `/images/badges/question/50.png`);
    
    await badgeCreate(strings.BA1_NAME, strings.BA1_DESCRIPTION, 'answer', 1, `/images/badges/answer/1.png`);
    await badgeCreate(strings.BA10_NAME, strings.BA10_DESCRIPTION, 'answer', 10, `/images/badges/answer/10.png`);
    await badgeCreate(strings.BA50_NAME, strings.BA50_DESCRIPTION, 'answer', 50, `/images/badges/answer/50.png`);
    
    await badgeCreate(strings.BC1_NAME, strings.BC1_DESCRIPTION, 'comment', 1, `/images/badges/comment/1.png`);
    await badgeCreate(strings.BC10_NAME, strings.BC10_DESCRIPTION, 'comment', 10, `/images/badges/comment/10.png`);
    await badgeCreate(strings.BC50_NAME, strings.BC50_DESCRIPTION, 'comment', 50, `/images/badges/comment/50.png`);
    
    await badgeCreate(strings.BN1_NAME, strings.BN1_DESCRIPTION, 'nim', 1, `/images/badges/nim/1.png`);
    await badgeCreate(strings.BN5_NAME, strings.BN5_DESCRIPTION, 'nim', 5, `/images/badges/nim/5.png`);
    await badgeCreate(strings.BN10_NAME, strings.BN10_DESCRIPTION, 'nim', 10, `/images/badges/nim/10.png`);    

    await userCreate('sama', 'sama', new Date('2023-12-11T03:30:00'), 'I am a student.');
    await userCreate('kyle', 'kyle', new Date('2022-12-11T03:30:00'), 'I am a software engineer.');
    await userCreate('nitsa', 'nitsa', new Date('2023-12-11T03:30:00'), 'I am a designer.');
    await userCreate('annabelle', 'annabelle', new Date('2022-12-11T03:30:00'), 'I am a manager.');

    const t1 = await tagCreate(strings.T1_NAME, strings.T1_DESC);
    const t2 = await tagCreate(strings.T2_NAME, strings.T2_DESC);
    const t3 = await tagCreate(strings.T3_NAME, strings.T3_DESC);
    const t4 = await tagCreate(strings.T4_NAME, strings.T4_DESC);
    const t5 = await tagCreate(strings.T5_NAME, strings.T5_DESC);
    const t6 = await tagCreate(strings.T6_NAME, strings.T6_DESC);

    const c1 = await commentCreate(strings.C1_TEXT, 'sama', new Date('2023-12-12T03:30:00'));
    const c2 = await commentCreate(strings.C2_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));
    const c3 = await commentCreate(strings.C3_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));

    const a1 = await answerCreate(strings.A1_TXT, 'annabelle', new Date('2023-11-20T03:24:42'), [c1]);
    const a2 = await answerCreate(strings.A2_TXT, 'kyle', new Date('2023-11-23T08:24:00'), [c2]);
    const a3 = await answerCreate(strings.A2_TXT, 'kyle', new Date('2023-11-23T08:24:00'), [c2]);

    const q1 = await questionCreate(
      strings.Q1_DESC,
      strings.Q1_TXT,
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