import React from 'react';
import './index.css';
import { Box, Typography } from '@mui/material';
import QuestionHeader from './header';
import QuestionView from './question';
import useQuestionPage from '../../../hooks/useQuestionPage';

/**
 * QuestionPage component renders a page displaying a list of questions
 * based on filters such as order and search terms.
 * It includes a header with order buttons and a button to ask a new question.
 */
const QuestionPage = () => {
  const { titleText, qlist, setQuestionOrder } = useQuestionPage();

  return (
    <Box sx={{ p: 4 }}>
      <QuestionHeader
        titleText={titleText}
        qcnt={qlist.length}
        setQuestionOrder={setQuestionOrder}
      />
      <Box sx={{ mt: 2 }}>
        {qlist.map(q => (
          <QuestionView question={q} key={String(q._id)} />
        ))}
      </Box>
      {titleText === 'Search Results' && !qlist.length && (
        <Typography variant='h6' fontWeight='bold' sx={{ mt: 2 }}>
          No Questions Found
        </Typography>
      )}
    </Box>
  );
};

export default QuestionPage;
