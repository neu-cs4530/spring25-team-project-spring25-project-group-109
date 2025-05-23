import mongoose from 'mongoose';
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
  DatabaseNotification,
  NotificationType,
  Notification,
} from './types/types';
import * as strings from './data/posts_strings';
import CommentModel from './models/comments.model';
import UserModel from './models/users.model';
import BadgeModel from './models/badge.model';
import { checkAndAwardBadges } from './services/badge.service';
import StoreModel from './models/store.model';
import FeatureModel from './models/feature.model';
import NotificationModel from './models/notification.model';

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
  const comment = await CommentModel.create(commentDetail);
  const stats = await UserStatsModel.findOneAndUpdate(
    { username: commentBy },
    { $inc: { commentsCount: 1 } },
    { new: true },
  );
  if (stats) {
    await checkAndAwardBadges(commentBy);
  }
  return comment;
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
  const answer = await AnswerModel.create(answerDetail);
  const stats = await UserStatsModel.findOneAndUpdate(
    { username: ansBy },
    { $inc: { answersCount: 1 } },
    { new: true },
  );
  if (stats) {
    await checkAndAwardBadges(ansBy);
  }
  return answer;
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
  const question = await QuestionModel.create({
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
  const stats = await UserStatsModel.findOneAndUpdate(
    { username: question.askedBy },
    { $inc: { questionsCount: 1 } },
    { new: true },
  );
  if (stats) {
    await checkAndAwardBadges(question.askedBy);
  }
  return question;
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
  description: string,
  price: number,
): Promise<DatabaseFeature> {
  if (name === null || price <= 0) {
    throw new Error('Invalid Feature Format');
  }

  const feature: Feature = {
    name,
    description,
    price,
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
  unlockedFeatures?: FeatureType[],
  profilePhoto?: string,
): Promise<DatabaseUser> {
  if (username === '' || password === '' || dateJoined === null) {
    throw new Error('Invalid User Format');
  }

  const userDetail: User = {
    username,
    password,
    dateJoined,
    biography: biography ?? '',
    badgesEarned: [],
    followers: [],
    following: [],
    profilePhoto: profilePhoto ?? '',
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
    unlockedFeatures: unlockedFeatures ?? [],
  };
  await StoreModel.create(userStore);

  return user;
}

async function notificationCreate(
  username: string,
  text: string,
  seen: boolean,
  type: NotificationType,
  link: string,
): Promise<DatabaseNotification> {
  if (username === '' || text === '' || seen === null || type === null || link === null)
    throw new Error('Invalid Notification Format');
  const notification: Notification = {
    username,
    text,
    seen,
    type,
    link,
  };
  return await NotificationModel.create(notification);
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
  try {    await featureCreate("Nim", strings.NIM_FEATURE_DESCRIPTION, 5);
    await featureCreate("Additional Avatars", strings.AVATAR_FEATURE_DESCRIPTION, 10);
    await featureCreate("Custom Profile Photo", strings.PROFILE_FEATURE_DESCRIPTION, 15);
    
    const q1badge = await badgeCreate(strings.BQ1_NAME, strings.BQ1_DESCRIPTION, 'question', 1, `/images/badges/question/1.png`);
    await badgeCreate(strings.BQ10_NAME, strings.BQ10_DESCRIPTION, 'question', 10, `/images/badges/question/10.png`);
    await badgeCreate(strings.BQ50_NAME, strings.BQ50_DESCRIPTION, 'question', 50, `/images/badges/question/50.png`);

    const a1badge = await badgeCreate(
      strings.BA1_NAME,
      strings.BA1_DESCRIPTION,
      'answer',
      1,
      `/images/badges/answer/1.png`,
    );
    await badgeCreate(
      strings.BA10_NAME,
      strings.BA10_DESCRIPTION,
      'answer',
      10,
      `/images/badges/answer/10.png`,
    );
    await badgeCreate(
      strings.BA50_NAME,
      strings.BA50_DESCRIPTION,
      'answer',
      50,
      `/images/badges/answer/50.png`,
    );

    const c1badge = await badgeCreate(
      strings.BC1_NAME,
      strings.BC1_DESCRIPTION,
      'comment',
      1,
      `/images/badges/comment/1.png`,
    );
    await badgeCreate(
      strings.BC10_NAME,
      strings.BC10_DESCRIPTION,
      'comment',
      10,
      `/images/badges/comment/10.png`,
    );
    await badgeCreate(
      strings.BC50_NAME,
      strings.BC50_DESCRIPTION,
      'comment',
      50,
      `/images/badges/comment/50.png`,
    );

    await badgeCreate(
      strings.BN1_NAME,
      strings.BN1_DESCRIPTION,
      'nim',
      1,
      `/images/badges/nim/1.png`,
    );
    await badgeCreate(
      strings.BN5_NAME,
      strings.BN5_DESCRIPTION,
      'nim',
      5,
      `/images/badges/nim/5.png`,
    );
    await badgeCreate(
      strings.BN10_NAME,
      strings.BN10_DESCRIPTION,
      'nim',
      10,
      `/images/badges/nim/10.png`,
    );

    await userCreate('sama', 'sama', new Date('2023-12-11T03:30:00'), 'I am a student.', ['Nim'], '/images/avatars/avatar1.png');
    await userCreate('kyle', 'kyle', new Date('2022-12-11T03:30:00'), 'I am a software engineer.', ['Nim'], '/images/avatars/avatar2.png');
    await userCreate('nitsa', 'nitsa', new Date('2023-12-11T03:30:00'), 'I am a designer.', ['Custom Profile Photo'], '/images/avatars/avatar3.png');
    await userCreate('annabelle', 'annabelle', new Date('2022-12-11T03:30:00'), 'I am a manager.', [], '/images/avatars/avatar4.png');
    await userCreate('james', 'james', new Date('2023-12-11T03:30:00'), 'I am a teacher.', ['Additional Avatars'], '/images/avatars/additional/avatar1.png');
    await userCreate('kristen', 'kristen', new Date(), 'I am a doctor.', [], '/images/avatars/avatar5.png');
    await userCreate('julia', 'julia', new Date(), 'I am a lawyer.', [], '/images/avatars/additional/avatar2.png');
    await userCreate('eric', 'eric', new Date(), 'I am a chef.', [], '/images/avatars/additional/avatar3.png');
    await userCreate('lee', 'lee', new Date(), 'I am a scientist.', [], '/images/avatars/additional/avatar4.png');

    const t1 = await tagCreate(strings.T1_NAME, strings.T1_DESC);
    const t2 = await tagCreate(strings.T2_NAME, strings.T2_DESC);
    const t3 = await tagCreate(strings.T3_NAME, strings.T3_DESC);
    const t4 = await tagCreate(strings.T4_NAME, strings.T4_DESC);
    const t5 = await tagCreate(strings.T5_NAME, strings.T5_DESC);
    const t6 = await tagCreate(strings.T6_NAME, strings.T6_DESC);

    const c1 = await commentCreate(strings.C1_TEXT, 'sama', new Date('2023-12-12T03:30:00'));
    const c2 = await commentCreate(strings.C2_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));
    const c3 = await commentCreate(strings.C3_TEXT, 'nitsa', new Date('2023-12-01T15:24:19'));

    const a1 = await answerCreate(strings.A1_TXT, 'annabelle', new Date('2023-11-20T03:24:42'), [
      c1,
    ]);
    const a2 = await answerCreate(strings.A2_TXT, 'kyle', new Date('2023-11-23T08:24:00'), [c2]);

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

    await questionCreate(
      strings.Q2_DESC,
      strings.Q2_TXT,
      [t3, t4],
      [],
      'annabelle',
      new Date('2023-11-20T03:24:42'),
      [],
      [],
    );

    await questionCreate(
      strings.Q3_DESC,
      strings.Q3_TXT,
      [t5, t6],
      [],
      'nitsa',
      new Date('2023-11-23T08:24:00'),
      [],
      [],
    );

    // fill the leaderboard
    const ans1 = await answerCreate("Make sure you're not directly mutating state. Always use the setter function returned by useState.", "lee", new Date(), []);
    const ans2 = await answerCreate("Use `document.createElement` and `appendChild`. Remember to wait for the DOM to load with `DOMContentLoaded`.", "kyle", new Date(), []);
    const ans3 = await answerCreate("Try upgrading your Gradle version manually in `gradle-wrapper.properties` and syncing again.", "julia", new Date(), []);
    const ans4 = await answerCreate("You can save login state using `SharedPreferences` and check it in your `onCreate()` method.", "eric", new Date(), []);
    const ans5 = await answerCreate("localStorage persists until cleared manually, while sessionStorage is cleared when the browser/tab closes.", "kristen", new Date(), []);
    const ans6 = await answerCreate("Ensure your `<link>` tag is placed inside the `<head>` and the path to your CSS file is correct.", "james", new Date(), []);
    const ans7 = await answerCreate("Consider splitting components into 'pages', 'components', and 'utils'. Use index.js for module exports.", "eric", new Date(), []);
    const ans8 = await answerCreate("SharedPreferences is not ideal for large objects. Use SQLite or Room instead.", "julia", new Date(), []);
    const ans9 = await answerCreate("Call `context.getSharedPreferences().edit().clear().apply()` and use `context.getCacheDir().delete()` recursively.", "lee", new Date(), []);
    const ans10 = await answerCreate("Use the `gh-pages` npm package. Make sure to update your package.json `homepage` field too.", "annabelle", new Date(), []);
    const ans11 = await answerCreate("To manipulate the DOM directly in plain JavaScript, you can use `document.createElement()` and `appendChild()` to add elements.", "eric", new Date(), []);
    const ans12 = await answerCreate("SharedPreferences is a great option for persisting simple data like login state. You can store a boolean indicating whether the user is logged in and check it when the app starts.", "eric", new Date(), []);
    const ans13 = await answerCreate("Both localStorage and sessionStorage are used to store data in the browser. localStorage is persistent; sessionStorage clears on tab close.", "eric", new Date(), []);

    // example questionCreate entries with updated users
    await questionCreate(
      "Why isn't my React component updating state correctly?",
      "I'm using useState in a React component, but the UI isn't updating as expected. What could cause this?",
      [t1, t2],
      [ans1],
      "julia",
      new Date(),
      ["lee"],
      []
    );

    await questionCreate(
      "How do I manipulate the DOM in plain JavaScript?",
      "I want to add a new div to my page when a button is clicked, without using jQuery or frameworks.",
      [t2, t6],
      [ans2, ans11],
      "eric",
      new Date(),
      ["kyle"],
      []
    );

    await questionCreate(
      "How do I fix Android Studio's build.gradle sync errors?",
      "I just updated Android Studio and now my project won't sync. The error is in the Gradle files.",
      [t3],
      [ans3],
      "lee",
      new Date(),
      ["julia"],
      []
    );

    await questionCreate(
      "How to persist user login state using SharedPreferences?",
      "What's the best way to keep a user logged in after restarting the app in Android?",
      [t3, t4],
      [ans4, ans12],
      "sama",
      new Date(),
      ["eric"],
      []
    );

    await questionCreate(
      "What is the difference between localStorage and sessionStorage?",
      "I'm confused about when to use localStorage versus sessionStorage in a web app.",
      [t2, t5, t6],
      [ans5, ans13],
      "nitsa",
      new Date(),
      ["kristen"],
      []
    );

    await questionCreate(
      "How do I link stylesheets correctly on a website?",
      "My styles.css file doesn't seem to be applying on my homepage. What could be wrong?",
      [t2, t6],
      [ans6],
      "annabelle",
      new Date(),
      ["james"],
      []
    );

    await questionCreate(
      "How to organize large React projects?",
      "My React codebase is getting messy. Any advice on folder structure or file naming conventions?",
      [t1, t6],
      [ans7],
      "kristen",
      new Date(),
      ["eric"],
      []
    );

    await questionCreate(
      "Can I store large objects in SharedPreferences?",
      "I need to save a list of user preferences as an object. Is SharedPreferences the right tool?",
      [t4, t5],
      [ans8],
      "james",
      new Date(),
      ["julia"],
      []
    );

    await questionCreate(
      "How do I clear app storage programmatically in Android?",
      "Is there a method to clear all SharedPreferences and cache data on a button click?",
      [t3, t4, t5],
      [ans9],
      "kyle",
      new Date(),
      ["lee"],
      []
    );

    await questionCreate(
      "How do I deploy a React website to GitHub Pages?",
      "I finished a React project and want to host it for free. What's the best way to do this?",
      [t1, t6],
      [ans10],
      "sama",
      new Date(),
      ["annabelle"],
      []
    );
    
    await notificationCreate(
      'sama',
      `You have earned the badge ${q1badge.name}: ${q1badge.description}!`,
      true,
      'badge',
      `/user/sama`,
    );
    await notificationCreate(
      'sama',
      `annabelle answered your question: "${q1.title}"`,
      true,
      'answer',
      `/question/${q1._id}`,
    );
    await notificationCreate(
      'annabelle',
      `You have earned the badge ${a1badge.name}: ${a1badge.description}!`,
      true,
      'badge',
      `/user/annabelle`,
    );
    await notificationCreate(
      'sama',
      `kyle answered your question: "${q1.title}"`,
      true,
      'answer',
      `/question/${q1._id}`,
    );
    await notificationCreate(
      'kyle',
      `You have earned the badge ${a1badge.name}: ${a1badge.description}!`,
      true,
      'badge',
      `/user/kyle`,
    );
    await notificationCreate(
      'sama',
      `nitsa commented on your question: "${q1.title}"`,
      false,
      'comment',
      `/question/${q1._id}`,
    );
    await notificationCreate(
      'nitsa',
      `You have earned the badge ${c1badge.name}: ${c1badge.description}!`,
      true,
      'badge',
      `/user/nitsa`,
    );
    await notificationCreate(
      'annabelle',
      `sama commented on your answer on "${q1.title}"`,
      true,
      'comment',
      `/question/${q1._id}`,
    );
    await notificationCreate(
      'sama',
      `You have earned the badge ${c1badge.name}: ${c1badge.description}!`,
      false,
      'badge',
      `/user/sama`,
    );
    await notificationCreate(
      'kyle',
      `nitsa commented on your answer on "${q1.title}"`,
      true,
      'comment',
      `/question/${q1._id}`,
    );
    await notificationCreate(
      'annabelle',
      `You have earned the badge ${q1badge.name}: ${q1badge.description}!`,
      false,
      'badge',
      `/user/annabelle`,
    );
    await notificationCreate(
      'nitsa',
      `You have earned the badge ${q1badge.name}!`,
      false,
      'badge',
      `/user/nitsa`,
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
