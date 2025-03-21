import React from 'react';
import './index.css';
import { Box, Divider, Typography } from '@mui/material';
import { handleHyperlink } from '../../../../tool';

/**
 * Interface representing the props for the QuestionBody component.
 *
 * - views - The number of views the question has received.
 * - text - The content of the question, which may contain hyperlinks.
 * - askby - The username of the user who asked the question.
 * - meta - Additional metadata related to the question, such as the date and time it was asked.
 */
interface QuestionBodyProps {
  views: number;
  text: string;
  askby: string;
  meta: string;
}

/**
 * QuestionBody component that displays the body of a question.
 * It includes the number of views, the question content (with hyperlink handling),
 * the username of the author, and additional metadata.
 *
 * @param views The number of views the question has received.
 * @param text The content of the question.
 * @param askby The username of the question's author.
 * @param meta Additional metadata related to the question.
 */
const QuestionBody = ({ views, text, askby, meta }: QuestionBodyProps) => (
  <Box>
    <Typography variant='body1' sx={{ mb: 2 }}>
      {handleHyperlink(text)}
    </Typography>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant='body2' fontWeight='bold'>
        {askby}, {views} views
      </Typography>
      <Typography variant='caption' color='textSecondary'>
        asked {meta}
      </Typography>
    </Box>
    <Divider sx={{ mt: 2 }} />
  </Box>
);
export default QuestionBody;
