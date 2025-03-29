import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { PopulatedDatabaseAnswer, UserResponse } from '@fake-stack-overflow/shared';
import { app } from '../../app';
import * as answerUtil from '../../services/answer.service';
import * as databaseUtil from '../../utils/database.util';
import * as userUtil from '../../services/user.service';
import * as notifUtil from '../../services/notification.service';
import QuestionModel from '../../models/questions.model';

const saveAnswerSpy = jest.spyOn(answerUtil, 'saveAnswer');
const addAnswerToQuestionSpy = jest.spyOn(answerUtil, 'addAnswerToQuestion');
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');
const saveNotificationSpy = jest.spyOn(notifUtil, 'saveNotification');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

const ans2: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6dd'),
  text: 'Answer 2 Text',
  ansBy: 'answer2_user',
  ansDateTime: new Date('2024-06-10'),
  comments: [],
};

const ans3: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6df'),
  text: 'Answer 3 Text',
  ansBy: 'answer3_user',
  ansDateTime: new Date('2024-06-11'),
  comments: [],
};

const ans4: PopulatedDatabaseAnswer = {
  _id: new mongoose.Types.ObjectId('65e9b58910afe6e94fc6e6de'),
  text: 'Answer 4 Text',
  ansBy: 'answer4_user',
  ansDateTime: new Date('2024-06-14'),
  comments: [],
};

const MOCK_POPULATED_ANSWERS = [ans2, ans3, ans4];

const simplifyAnswer = (answer: PopulatedDatabaseAnswer) => ({
  ...answer,
  _id: answer._id.toString(), // Converting ObjectId to string
  ansDateTime: answer.ansDateTime.toISOString(),
});

const EXPECTED_ANSWERS = MOCK_POPULATED_ANSWERS.map(answer => simplifyAnswer(answer));

describe('POST /addAnswer', () => {
  it('should add a new answer to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validAid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };
    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    };

    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);

    popDocSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer],
      comments: [],
    });

    mockingoose(QuestionModel).toReturn(mockQuestion, 'findOne');
    saveNotificationSpy.mockResolvedValueOnce({
      _id: new mongoose.Types.ObjectId(),
      username: 'user1',
      text: 'user2 answered your question: "question"',
      seen: false,
      type: 'answer',
      link: '/question/1234',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validAid.toString(),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: mockAnswer.ansDateTime.toISOString(),
      comments: [],
    });
    expect(saveNotificationSpy).toHaveBeenCalled();
  });

  it('should return bad request error if answer text property is missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid answer');
  });

  it('should return bad request error if request body has qid property missing', async () => {
    const mockReqBody = {
      ans: {
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansBy property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if answer object has ansDateTime property missing', async () => {
    const mockReqBody = {
      qid: 'dummyQuestionId',
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(400);
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/answer/addAnswer');

    expect(response.status).toBe(400);
  });

  it('should return database error in response if saveAnswer method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if update question method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return database error in response if `populateDocument` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      qid: validQid,
      ans: {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
      },
    };

    const mockAnswer = {
      _id: new ObjectId('507f191e810c19729de860ea'),
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
    };

    const mockQuestion = {
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [mockAnswer._id],
      comments: [],
    };

    saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
    addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });
});

describe('GET /getAnswerFeed/:username', () => {
  const mockUser = { username: 'testuser1', _id: 'fakeid', following: ['testuser2'] };
  it('should return a answer array of answers the user is following when the username is passed as the request parameter', async () => {
    // Mock request parameters

    const mockReqParams = {
      username: 'answer3_user',
    };

    // Provide mock question data
    jest.spyOn(answerUtil, 'fetchAnswersByFollowing').mockResolvedValueOnce(MOCK_POPULATED_ANSWERS);

    jest
      .spyOn(userUtil, 'getUserByUsername')
      .mockResolvedValueOnce(mockUser as unknown as UserResponse);

    // Making the request
    const response = await supertest(app).get(`/answer/getAnswerFeed/${mockReqParams.username}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual(EXPECTED_ANSWERS);
  });

  it('should return bad request error if the username is not provided', async () => {
    // Making the request
    const response = await supertest(app).get(`/answer/getAnswerFeed/`);

    // Asserting the response
    expect(response.status).toBe(404);
  });

  it('should return database error if the user fetch fails', async () => {
    // Mock request parameters
    const mockReqParams = {
      username: 'answer3_user',
    };

    jest
      .spyOn(userUtil, 'getUserByUsername')
      .mockResolvedValueOnce({ error: 'Failed to get user.' });

    // Making the request
    const response = await supertest(app).get(`/answer/getAnswerFeed/${mockReqParams.username}`);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when fetching answer feed by username: Failed to get user.');
  });

  it('should return database error when fetching the answers', async () => {
    // Mock request parameters
    const mockReqParams = {
      username: 'answer3_user',
    };

    jest
      .spyOn(userUtil, 'getUserByUsername')
      .mockResolvedValueOnce(mockUser as unknown as UserResponse);

    jest
      .spyOn(answerUtil, 'fetchAnswersByFollowing')
      .mockResolvedValueOnce({ error: 'Failed to get answers.' });

    // Making the request
    const response = await supertest(app).get(`/answer/getAnswerFeed/${mockReqParams.username}`);

    // Asserting the response
    expect(response.status).toBe(500);
    expect(response.text).toBe(
      'Error when fetching answer feed by username: Failed to get answers.',
    );
  });

  it('should empty array when no answers', async () => {
    // Mock request parameters
    const mockReqParams = {
      username: 'answer3_user',
    };

    jest
      .spyOn(userUtil, 'getUserByUsername')
      .mockResolvedValueOnce({ username: 'mockUserOne' } as UserResponse);

    // Making the request
    const response = await supertest(app).get(`/answer/getAnswerFeed/${mockReqParams.username}`);

    // Asserting the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
