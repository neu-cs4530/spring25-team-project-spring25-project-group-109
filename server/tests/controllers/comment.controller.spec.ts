import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../../app';
import * as commentUtil from '../../services/comment.service';
import * as databaseUtil from '../../utils/database.util';
import * as notificationUtil from '../../services/notification.service';
import QuestionModel from '../../models/questions.model';
import AnswerModel from '../../models/answers.model';

const saveCommentSpy = jest.spyOn(commentUtil, 'saveComment');
const addCommentSpy = jest.spyOn(commentUtil, 'addComment');
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');
const saveNotificationSpy = jest.spyOn(notificationUtil, 'saveNotification');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('POST /addComment', () => {
  it('should add a new comment to the question', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [],
      comments: [mockComment._id],
    });

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
      answers: [],
      comments: [mockComment],
    });

    mockingoose(QuestionModel).toReturn(
      {
        _id: validQid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [],
        comments: [],
      },
      'findOne',
    );

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

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validCid.toString(),
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: mockComment.commentDateTime.toISOString(),
    });
  });

  it('should add a new comment to the answer', async () => {
    const validAid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validAid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment._id],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment],
    });

    mockingoose(AnswerModel).toReturn(
      {
        _id: validAid,
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
      },
      'findOne',
    );
    saveNotificationSpy.mockResolvedValueOnce({
      _id: new ObjectId(),
      username: 'original-user',
      text: 'new-user commented on your answer on "Sample Question"',
      seen: false,
      type: 'comment',
      link: '/question/65e9b5a995b6c7045a30d823',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      _id: validCid.toString(),
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: mockComment.commentDateTime.toISOString(),
    });
  });

  it('should return 500 response if findOne returns null', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [],
      comments: [mockComment._id],
    });

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
      answers: [],
      comments: [mockComment],
    });

    mockingoose(QuestionModel).toReturn(null, 'findOne');

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 if saveNotification throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce({
      _id: validQid,
      title: 'This is a test question',
      text: 'This is a test question',
      tags: [],
      askedBy: 'dummyUserId',
      askDateTime: new Date('2024-06-03'),
      views: [],
      upVotes: [],
      downVotes: [],
      answers: [],
      comments: [mockComment._id],
    });

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
      answers: [],
      comments: [mockComment],
    });

    mockingoose(QuestionModel).toReturn(
      {
        _id: validQid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [],
        comments: [],
      },
      'findOne',
    );

    saveNotificationSpy.mockResolvedValueOnce({ error: 'Error when saving notification' });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 response if AnswerModel returns null', async () => {
    const validAid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validAid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment._id],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment],
    });

    mockingoose(AnswerModel).toReturn(null, 'findOne');

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 if findOne Question returns null', async () => {
    const validAid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validAid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment._id],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment],
    });

    mockingoose(AnswerModel).toReturn(
      {
        _id: validAid,
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
      },
      'findOne',
    );

    mockingoose(QuestionModel).toReturn(null, 'findOne');

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return 500 if answer saveNotification throws an error', async () => {
    const validAid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validAid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);

    addCommentSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment._id],
    });

    popDocSpy.mockResolvedValueOnce({
      _id: validAid,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [mockComment],
    });

    mockingoose(AnswerModel).toReturn(
      {
        _id: validAid,
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
      },
      'findOne',
    );

    mockingoose(QuestionModel).toReturn(
      {
        _id: validAid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [],
        comments: [],
      },
      'findOne',
    );
    saveNotificationSpy.mockResolvedValueOnce({ error: 'Error when saving notification' });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Error when saving notification');
  });

  it('should return bad request error if id property missing', async () => {
    const mockReqBody = {
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if type property is missing', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      comment: {
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if type property is not `question` or `answer` ', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'invalidType',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if comment text property is missing', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if text property of comment is empty', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'answer',
      comment: {
        text: '',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid comment body');
  });

  it('should return bad request error if commentBy property missing', async () => {
    const mockReqBody = {
      id: 'dummyQuestionId',
      type: 'question',
      com: {
        text: 'This is a test comment',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if commentDateTime property missing', async () => {
    const mockReqBody = {
      id: 'dummyQuestionId',
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if request body is missing', async () => {
    const response = await supertest(app).post('/comment/addComment');

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid request');
  });

  it('should return bad request error if qid is not a valid ObjectId', async () => {
    const mockReqBody = {
      id: 'invalidObjectId',
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Invalid ID format');
  });

  it('should return database error in response if saveComment method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'answer',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    saveCommentSpy.mockResolvedValueOnce({ error: 'Error when saving a comment' });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Error when saving a comment');
  });

  it('should return database error in response if `addComment` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce({
      error: 'Error when adding comment',
    });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Error when adding comment');
  });

  it('should return database error in response if `populateDocument` method throws an error', async () => {
    const validQid = new mongoose.Types.ObjectId();
    const validCid = new mongoose.Types.ObjectId();
    const mockReqBody = {
      id: validQid.toString(),
      type: 'question',
      comment: {
        text: 'This is a test comment',
        commentBy: 'dummyUserId',
        commentDateTime: new Date('2024-06-03'),
      },
    };

    const mockComment = {
      _id: validCid,
      text: 'This is a test comment',
      commentBy: 'dummyUserId',
      commentDateTime: new Date('2024-06-03'),
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
      answers: [],
      comments: [mockComment._id],
    };

    saveCommentSpy.mockResolvedValueOnce(mockComment);
    addCommentSpy.mockResolvedValueOnce(mockQuestion);
    popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

    const response = await supertest(app).post('/comment/addComment').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Error when adding comment: Error when populating document');
  });
});
