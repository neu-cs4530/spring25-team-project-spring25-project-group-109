import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import {
  Badge,
  Notification,
  DatabaseAnswer,
  DatabaseBadge,
  DatabaseComment,
  DatabaseFeature,
  DatabaseNotification,
  DatabaseQuestion,
  DatabaseStore,
  DatabaseTag,
  DatabaseUserStats,
  PopulatedDatabaseQuestion,
  PopulatedFeedQuestion,
  SafeDatabaseUser,
  User,
  UserStats,
} from '../types/types';
import { T1_DESC, T2_DESC, T3_DESC } from '../data/posts_strings';

export const tag1: DatabaseTag = {
  _id: new ObjectId('507f191e810c19729de860ea'),
  name: 'react',
  description: T1_DESC,
};

export const tag2: DatabaseTag = {
  _id: new ObjectId('65e9a5c2b26199dbcc3e6dc8'),
  name: 'javascript',
  description: T2_DESC,
};

export const tag3: DatabaseTag = {
  _id: new ObjectId('65e9b4b1766fca9451cba653'),
  name: 'android',
  description: T3_DESC,
};

export const com1: DatabaseComment = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'com1',
  commentBy: 'com_by1',
  commentDateTime: new Date('2023-11-18T09:25:00'),
};

export const ans1: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
  text: 'ans1',
  ansBy: 'ansBy1',
  ansDateTime: new Date('2023-11-18T09:24:00'),
  comments: [],
};

export const ans2: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'ans2',
  ansBy: 'ansBy2',
  ansDateTime: new Date('2023-11-20T09:24:00'),
  comments: [],
};

export const ans3: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'ans3',
  ansBy: 'ansBy3',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const ans4: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'ans4',
  ansBy: 'ansBy4',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const ans5: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6ab'),
  text: 'ans5',
  ansBy: 'user1',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const ans6: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6bc'),
  text: 'ans6',
  ansBy: 'user2',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const ans7: DatabaseAnswer = {
  _id: new ObjectId('65e9b58910afe6e94fc6e6bc'),
  text: 'ans7',
  ansBy: 'user2',
  ansDateTime: new Date('2023-11-19T09:24:00'),
  comments: [],
};

export const QUESTIONS: DatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3._id, tag2._id],
    answers: [ans1._id, ans2._id],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1._id, tag2._id],
    answers: [ans1._id, ans2._id, ans3._id],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

export const POPULATED_QUESTIONS: PopulatedDatabaseQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
    ],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
      { ...ans3, comments: [] },
    ],
    askedBy: 'q_by2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
  {
    _id: new ObjectId('65e9b716ff0e892116b2de09'),
    title: 'Unanswered Question #2',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'q_by4',
    askDateTime: new Date('2023-11-20T09:24:00'),
    views: [],
    upVotes: [],
    downVotes: [],
    comments: [],
  },
];

export const POPULATED_FEED_QUESTIONS: PopulatedFeedQuestion[] = [
  {
    _id: new ObjectId('65e9b58910afe6e94fc6e6dc'),
    title: 'Quick question about storage on android',
    text: 'I would like to know the best way to go about storing an array on an android phone so that even when the app/activity ended the data remains',
    tags: [tag3, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
    ],
    askedBy: 'q_by1',
    askDateTime: new Date('2023-11-16T09:24:00'),
    views: ['question1_user', 'question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    feedReasons: ['askedByFollowed'],
    followedUpvoters: [],
  },
  {
    _id: new ObjectId('65e9b5a995b6c7045a30d823'),
    title: 'Object storage for a web application',
    text: 'I am currently working on a website where, roughly 40 million documents and images should be served to its users. I need suggestions on which method is the most suitable for storing content with subject to these requirements.',
    tags: [tag1, tag2],
    answers: [
      { ...ans1, comments: [] },
      { ...ans2, comments: [] },
      { ...ans3, comments: [] },
    ],
    askedBy: 'user2',
    askDateTime: new Date('2023-11-17T09:24:00'),
    views: ['question2_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    feedReasons: ['askedByFollowed'],
    followedUpvoters: ['sama'],
  },
  {
    _id: new ObjectId('65e9b9b44c052f0a08ecade0'),
    title: 'Is there a language to write programmes by pictures?',
    text: 'Does something like that exist?',
    tags: [],
    answers: [],
    askedBy: 'user3',
    askDateTime: new Date('2023-11-19T09:24:00'),
    views: ['question1_user', 'question2_user', 'question3_user', 'question4_user'],
    upVotes: [],
    downVotes: [],
    comments: [],
    feedReasons: ['upvotedByFollowed'],
    followedUpvoters: ['sama'],
  },
];

export const user: User = {
  username: 'user1',
  password: 'password',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

export const safeUser: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'user1',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

export const mockUserStatsFull: UserStats = {
  username: 'user1',
  questionsCount: 10,
  commentsCount: 0,
  answersCount: 0,
  nimWinCount: 0,
};

export const mockUserStats: UserStats = {
  username: 'user1',
  questionsCount: 0,
  commentsCount: 0,
  answersCount: 0,
  nimWinCount: 0,
};

export const mockDBUserStats: DatabaseUserStats = {
  ...mockUserStats,
  _id: new ObjectId(),
};

export const safeUserTwo: SafeDatabaseUser = {
  _id: new ObjectId(),
  username: 'user2',
  dateJoined: new Date('2024-12-03'),
  badgesEarned: [],
  followers: [],
  following: [],
};

export const badge: Badge = {
  name: 'Inquisitive',
  description: 'Asked 5 Questions',
  type: 'question',
  threshold: 5,
  imagePath: 'imagePath',
};

export const dbBadge: DatabaseBadge = {
  name: 'Inquisitive',
  description: 'Asked 5 Questions',
  type: 'question',
  threshold: 5,
  imagePath: 'imagePath',
  _id: new ObjectId(),
};

export const notification: Notification = {
  username: 'user1',
  text: 'notification1',
  seen: false,
  type: 'badge',
  link: '/user/user1',
};

export const mockDatabaseNotification: DatabaseNotification = {
  _id: new ObjectId(),
  username: 'user1',
  text: 'notification1',
  seen: false,
  type: 'badge',
  link: '/user/user1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockNotificationJSONResponse = {
  ...mockDatabaseNotification,
  _id: mockDatabaseNotification._id.toString(),
  createdAt: mockDatabaseNotification.createdAt.toISOString(),
  updatedAt: mockDatabaseNotification.updatedAt.toISOString(),
};

export const mockDatabaseStore: DatabaseStore = {
  _id: new mongoose.Types.ObjectId(),
  username: 'user1',
  coinCount: 0,
  unlockedFeatures: [],
};

export const mockStoreJSONResponse = {
  _id: mockDatabaseStore._id.toString(),
  username: 'user1',
  coinCount: 0,
  unlockedFeatures: [],
};

export const mockFeature: DatabaseFeature = {
  _id: new mongoose.Types.ObjectId(),
  name: 'Nim',
  description: 'description',
  price: 0,
};

export const mockFeatureJSONResponse: DatabaseFeature = {
  ...mockFeature,
  _id: mockFeature._id.toString(),
};
