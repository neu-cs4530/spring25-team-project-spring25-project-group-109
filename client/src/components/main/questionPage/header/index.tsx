import './index.css';
import { Box, Button, Stack, Typography } from '@mui/material';
import { OrderType } from '../../../../types/types';
import { orderTypeDisplayName } from '../../../../types/constants';
import AskQuestionButton from '../../askQuestionButton';

/**
 * Interface representing the props for the QuestionHeader component.
 *
 * titleText - The title text displayed at the top of the header.
 * qcnt - The number of questions to be displayed in the header.
 * setQuestionOrder - A function that sets the order of questions based on the selected message.
 */
interface QuestionHeaderProps {
  titleText: string;
  qcnt: number;
  setQuestionOrder: (order: OrderType) => void;
}

/**
 * QuestionHeader component displays the header section for a list of questions.
 * It includes the title, a button to ask a new question, the number of the quesions,
 * and buttons to set the order of questions.
 *
 * @param titleText - The title text to display in the header.
 * @param qcnt - The number of questions displayed in the header.
 * @param setQuestionOrder - Function to set the order of questions based on input message.
 */
const QuestionHeader = ({ titleText, qcnt, setQuestionOrder }: QuestionHeaderProps) => (
  <Box>
    <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
      <Typography variant='h4' fontWeight='bold'>
        {titleText}
      </Typography>
      <AskQuestionButton />
    </Stack>

    <Stack direction='row' justifyContent='space-between' alignItems='center'>
      <Typography variant='body1' color='text.secondary'>
        {qcnt} questions
      </Typography>
      <Stack direction='row' spacing={1}>
        {Object.keys(orderTypeDisplayName).map(order => (
          <Button
            key={order}
            onClick={() => {
              setQuestionOrder(order as OrderType);
            }}>
            {orderTypeDisplayName[order as OrderType]}
          </Button>
        ))}
      </Stack>
    </Stack>
  </Box>
);

export default QuestionHeader;
