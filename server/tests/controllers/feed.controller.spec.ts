import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../../app';
import * as userUtil from '../../services/user.service';
import * as feedUtil from '../../services/feed.service';
import { PopulatedFeedQuestion } from '../../types/types';

const mockUser = {
  username: 'testuser',
  following: ['followed1', 'followed2'],
} as const;

const MOCK_POPULATED_QUESTIONS: PopulatedFeedQuestion[] = [
  {
    _id: new ObjectId(),
    title: 'Sample question',
    text: 'Sample text',
    askedBy: { username: 'followed1' },
    askDateTime: new Date('2024-01-01'),
    views: [],
    tags: [],
    answers: [],
    comments: [],
    upVotes: ['followed2'],
    downVotes: [],
    feedReasons: ['askedByFollowed', 'upvotedByFollowed'],
    followedUpvoters: ['followed2'],
  },
];

jest.spyOn(userUtil, 'getUserByUsername');
jest.spyOn(feedUtil, 'default');

describe('GET /getRecommendedFeed/:username', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return personalized questions if user and feed are valid', async () => {
    (userUtil.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
    (feedUtil.default as jest.Mock).mockResolvedValue(MOCK_POPULATED_QUESTIONS);

    const res = await supertest(app).get('/feed/getRecommendedFeed/testuser');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toEqual('Sample question');
    expect(res.body[0].feedReasons).toContain('askedByFollowed');
    expect(res.body[0].followedUpvoters).toContain('followed2');
  });

  it('should return empty array if user follows no one', async () => {
    (userUtil.getUserByUsername as jest.Mock).mockResolvedValue({
      username: 'testuser',
      following: [],
    });

    const res = await supertest(app).get('/feed/getRecommendedFeed/testuser');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('should return 404 if no username provided', async () => {
    const res = await supertest(app).get('/feed/getRecommendedFeed/');
    expect(res.status).toBe(404);
  });

  it('should return 500 if user lookup fails', async () => {
    (userUtil.getUserByUsername as jest.Mock).mockResolvedValue({ error: 'User not found' });

    const res = await supertest(app).get('/feed/getRecommendedFeed/testuser');
    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Error getting personalized feed/);
  });

  it('should return 500 if feed fetch fails', async () => {
    (userUtil.getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
    (feedUtil.default as jest.Mock).mockResolvedValue({ error: 'Something went wrong' });

    const res = await supertest(app).get('/feed/getRecommendedFeed/testuser');
    expect(res.status).toBe(500);
    expect(res.text).toMatch(/Error getting personalized feed/);
  });
});
