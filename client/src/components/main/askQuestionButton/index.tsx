import { Box, Button } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AskQuestionButton component that renders a button for navigating to the
 * "New Question" page. When clicked, it redirects the user to the page
 * where they can ask a new question.
 */
const AskQuestionButton = () => {
  const navigate = useNavigate();

  /**
   * Function to handle navigation to the "New Question" page.
   */
  const handleNewQuestion = () => {
    navigate('/new/question');
  };

  return (
    <Box>
      <Button
        sx={{ fontSize: '1.1rem', padding: '12px 18px' }}
        variant='contained'
        onClick={() => {
          handleNewQuestion();
        }}>
        Ask a Question
      </Button>
    </Box>
  );
};

export default AskQuestionButton;
