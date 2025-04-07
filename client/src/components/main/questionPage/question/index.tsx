import { useState } from 'react';
import { ObjectId } from 'mongodb';
import { useNavigate } from 'react-router-dom';
import { BookmarkBorder } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Avatar,
  Modal,
  IconButton,
} from '@mui/material';
import { getMetaData } from '../../../../tool';
import { PopulatedDatabaseQuestion } from '../../../../types/types';
import SaveToCollection from '../../saveToCollection';

interface QuestionProps {
  question: PopulatedDatabaseQuestion;
}

const QuestionView = ({ question }: QuestionProps) => {
  const navigate = useNavigate();
  const [showSaveModal, setShowSaveModal] = useState(false);

  const clickTag = (tagName: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('tag', tagName);
    navigate(`/home?${searchParams.toString()}`);
  };

  const handleAnswer = (questionID: ObjectId) => {
    if (!showSaveModal) {
      navigate(`/question/${questionID}`);
    }
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
        <Box
          display='flex'
          justifyContent='space-between'
          alignItems='center'
          mb={1}
          color='text.secondary'>
          <Box display='flex' gap={2}>
            <Typography variant='body2'>
              <strong>{question.answers.length || 0}</strong> answers
            </Typography>
            <Typography variant='body2'>
              <strong>{question.views.length}</strong> views
            </Typography>
          </Box>
          <IconButton
            color='secondary'
            onClick={e => {
              e.stopPropagation();
              setShowSaveModal(true);
            }}>
            <BookmarkBorder />
          </IconButton>
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
          <Stack spacing={1} direction='row' justifyContent='space-between' alignItems='center'>
            <Avatar alt='No Photo' src={question.askedBy.profilePhoto} />
            <Typography variant='body2' color='text.secondary'>
              <strong>{question.askedBy.username}</strong>
            </Typography>
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            {getMetaData(new Date(question.askDateTime))}
          </Typography>
        </Box>
      </CardContent>

      <Modal open={showSaveModal} onClose={() => setShowSaveModal(false)}>
        <Box onClick={e => e.stopPropagation()}>
          <SaveToCollection
            questionId={String(question._id)}
            onClose={() => setShowSaveModal(false)}
          />
        </Box>
      </Modal>
    </Card>
  );
};

export default QuestionView;
