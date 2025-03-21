import React from 'react';
import { ObjectId } from 'mongodb';
import { Paper, Typography, useTheme } from '@mui/material';
import { PopulatedDatabaseChat } from '../../../../types/types';

/**
 * ChatsListCard component displays information about a chat and allows the user to select it.
 *
 * @param chat: The chat object containing details like participants and chat ID.
 * @param handleChatSelect: A function to handle the selection of a chat, receiving the chat's ID as an argument.
 */
const ChatsListCard = ({
  chat,
  handleChatSelect,
}: {
  chat: PopulatedDatabaseChat;
  handleChatSelect: (chatID: ObjectId | undefined) => void;
}) => {
  const theme = useTheme();

  return (
    <Paper
      variant='outlined'
      onClick={() => handleChatSelect(chat._id)}
      style={{
        padding: theme.spacing(2),
        backgroundColor: theme.palette.background.default,
      }}>
      <Typography variant='body1'>
        <strong>Chat with:</strong> {chat.participants.join(', ')}
      </Typography>
    </Paper>
  );
};

export default ChatsListCard;
