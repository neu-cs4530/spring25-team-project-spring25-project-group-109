import React, { useState } from 'react';
import { Box, IconButton, Typography, Modal } from '@mui/material';
import { PopulatedDatabaseQuestion } from '@fake-stack-overflow/shared';
import { BookmarkBorder } from '@mui/icons-material';
import AskQuestionButton from '../../askQuestionButton';
import VoteComponent from '../../voteComponent';
import SaveToCollection from '../../saveToCollection';

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
const AnswerHeader = ({ question }: AnswerHeaderProps) => {
  const [showSaveModal, setShowSaveModal] = useState(false);

  return (
    <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
      <Box display='flex' alignItems='center' flexShrink={0}>
        <VoteComponent question={question} />
        <IconButton
          color='secondary'
          onClick={e => {
            e.stopPropagation();
            setShowSaveModal(true);
          }}>
          <BookmarkBorder />
        </IconButton>
      </Box>
      <Typography
        variant='h5'
        fontWeight='bold'
        sx={{ color: 'black', textAlign: 'center', flexGrow: 1 }}>
        {question.title}
      </Typography>
      <Box flexShrink={0}>
        <AskQuestionButton />
      </Box>

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <Box onClick={e => e.stopPropagation()}>
          <SaveToCollection
            questionId={String(question._id)}
            onClose={() => setShowSaveModal(false)}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default AnswerHeader;
