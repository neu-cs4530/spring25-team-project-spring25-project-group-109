import React from 'react';
import { Box, Paper, Stack, Typography, useTheme } from '@mui/material';
import { DatabaseMessage } from '../../../types/types';
import { getMetaData } from '../../../tool';

/**
 * MessageCard component displays a single message with its sender and timestamp.
 *
 * @param message: The message object to display.
 */
const MessageCard = ({ message }: { message: DatabaseMessage }) => {
  const theme = useTheme();

  return (
    <Paper
      variant='outlined'
      elevation={0}
      sx={{ p: 2, bgcolor: theme.palette.grey[100], borderRadius: 2, my: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <Stack>
          <Typography variant='body2' fontWeight={'bold'}>
            {message.msgFrom}
          </Typography>
          <Typography variant='body1'>{message.msg}</Typography>
        </Stack>
        <Typography color={theme.palette.grey[200]} variant='body2'>
          {getMetaData(new Date(message.msgDateTime))}
        </Typography>
      </Box>
    </Paper>
  );
};

export default MessageCard;
