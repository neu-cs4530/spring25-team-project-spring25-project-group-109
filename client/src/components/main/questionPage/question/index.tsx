import React from 'react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import './index.css';
import { Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';

/**
 * Interface representing the props for the Question component.
 *
 * q - The question object containing details about the question.
 */
interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

/**
 * Question component renders the details of a question including its title, tags, author, answers, and views.
 * Clicking on the component triggers the handleAnswer function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param q - The question object containing question details.
 */
const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();

  /**
   * Function to navigate to the home page with the specified tag as a search parameter.
   *
   * @param tagName - The name of the tag to be added to the search parameters.
   */
  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);

    navigate(`/home?${searchParams.toString()}`);
  };

  /**
   * Function to navigate to the specified question page based on the question ID.
   *
   * @param questionID - The ID of the question to navigate to.
   */
  const handleAnswer = (questionID: ObjectId) => {
    navigate(`/question/${questionID}`);
  };

  return (
    <Card
      sx={{
        'padding': 2,
        'marginBottom': 2,
        'borderRadius': 2,
        'cursor': 'pointer',
        'transition': '0.3s',
        '&:hover': { boxShadow: 4 },
      }}
      onClick={() => {
        if (question._id) handleAnswer(question._id);
      }}>
      <CardContent>
        <Box display='flex' gap={2} mb={1} color='text.secondary'>
          <Typography variant='body2'>
            <strong>{question.answers.length || 0}</strong> answers
          </Typography>
          <Typography variant='body2'>
            <strong>{question.views.length}</strong> views
          </Typography>
        </Box>

        <Typography variant='h6' color='primary' sx={{ fontWeight: 'bold', mb: 1 }}>
          {question.title}
        </Typography>

        <Stack direction='row' spacing={1} mb={2} flexWrap='wrap'>
          {question.tags.map(tag => (
            <Chip
              key={String(tag._id)}
              label={tag.name}
              onClick={e => {
                e.stopPropagation();
                clickTag(tag.name);
              }}
              color='primary'
              variant='outlined'
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>

        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='body2' color='text.secondary'>
            Asked by <strong>{question.askedBy}</strong>
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {getMetaData(new Date(question.askDateTime))}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuestionView;
