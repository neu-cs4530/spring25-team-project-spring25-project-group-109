import React from 'react';
import { Box, Button, Stack } from '@mui/material';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const { questionID, question, handleNewComment, handleNewAnswer } = useAnswerPage();

  if (!question) {
    return null;
  }

  return (
    <Box sx={{ p: 4 }}>
      <AnswerHeader question={question} />
      <Box mt={3}>
        <QuestionBody
          views={question.views.length}
          text={question.text}
          askby={question.askedBy}
          meta={getMetaData(new Date(question.askDateTime))}
        />
      </Box>
      <Box mt={3}>
        <CommentSection
          comments={question.comments}
          handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
        />
      </Box>
      <Stack spacing={3} mt={3}>
        {question.answers.map(a => (
          <AnswerView
            key={String(a._id)}
            text={a.text}
            ansBy={a.ansBy}
            meta={getMetaData(new Date(a.ansDateTime))}
            comments={a.comments}
            handleAddComment={(comment: Comment) =>
              handleNewComment(comment, 'answer', String(a._id))
            }
          />
        ))}
      </Stack>
      <Button
        sx={{ mt: 4, width: '100%' }}
        variant='contained'
        color='primary'
        onClick={handleNewAnswer}>
        Answer Question
      </Button>
    </Box>
  );
};

export default AnswerPage;
