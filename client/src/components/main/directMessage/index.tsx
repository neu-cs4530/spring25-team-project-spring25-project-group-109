import React from 'react';
import './index.css';
import { Alert, Box, Button, Paper, Stack, Typography, TextField } from '@mui/material';
import useDirectMessage from '../../../hooks/useDirectMessage';
import ChatsListCard from './chatsListCard';
import UsersListPage from '../usersListPage';
import MessageCard from '../messageCard';

/**
 * DirectMessage component renders a page for direct messaging between users.
 * It includes a list of users and a chat window to send and receive messages.
 */
const DirectMessage = () => {
  const {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
    error,
  } = useDirectMessage();

  return (
    <>
      <Box>
        <Stack spacing={2}>
          <Box paddingLeft={4} paddingTop={4}>
            <Button variant='contained' onClick={() => setShowCreatePanel(prevState => !prevState)}>
              {showCreatePanel ? 'Hide Create Chat Panel' : 'Start a Chat'}
            </Button>
            {error && <Alert severity='error'>{error}</Alert>}
          </Box>
          {showCreatePanel && (
            <Box>
              <Stack paddingLeft={4} spacing={1}>
                <Typography variant='body1'>
                  <strong>Selected user:</strong> {chatToCreate}
                </Typography>
                <Box>
                  <Button variant='contained' disabled={!chatToCreate} onClick={handleCreateChat}>
                    Chat With User
                  </Button>
                </Box>
              </Stack>
              <UsersListPage handleUserSelect={handleUserSelect} />
            </Box>
          )}
        </Stack>
      </Box>

      <Box p={4} display='flex' flexDirection='row' gap={2}>
        <Paper sx={{ p: 2, width: '20%' }}>
          <Stack spacing={2}>
            {chats.map(chat => (
              <ChatsListCard
                key={String(chat._id)}
                chat={chat}
                handleChatSelect={handleChatSelect}
              />
            ))}
          </Stack>
        </Paper>

        <Box
          className='chat-container'
          sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedChat ? (
            <>
              <Typography variant='h4'>Chat with {selectedChat.participants.join(', ')}</Typography>
              <Box
                className='chat-messages'
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  maxHeight: '50vh',
                  padding: 2,
                  backgroundColor: '#f7f7f7',
                  borderRadius: 2,
                }}>
                {selectedChat.messages.map(message => (
                  <MessageCard key={String(message._id)} message={message} />
                ))}
              </Box>

              <Box className='message-input' sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant='outlined'
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder='Type a message...'
                  size='small'
                />
                <Button
                  variant='contained'
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}>
                  Send
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant='h6'>Select a user to start chatting</Typography>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DirectMessage;
