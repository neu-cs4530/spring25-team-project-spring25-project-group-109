import React from 'react';
import './index.css';
import { Stack, Typography } from '@mui/material';
import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import AskQuestionButton from '../../askQuestionButton';
import VoteComponent from '../../voteComponent';

/**
 * Interface representing the props for the AnswerHeader component.
 *
 * - ansCount - The number of answers to display in the header.
 * - title - The title of the question or discussion thread.
 */
interface AnswerHeaderProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * AnswerHeader component that displays a header section for the answer page.
 * It includes the number of answers, the title of the question, and a button to ask a new question.
 *
 * @param ansCount The number of answers to display.
 * @param title The title of the question or discussion thread.
 */
const AnswerHeader = ({ question }: AnswerHeaderProps) => (
  <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={2}>
    <VoteComponent question={question} />
    <Typography
      variant='h5'
      fontWeight='bold'
      sx={{ color: 'black', flexGrow: 1, textAlign: 'center' }}>
      {question.title}
    </Typography>
    <AskQuestionButton />
  </Stack>
);

export default AnswerHeader;
