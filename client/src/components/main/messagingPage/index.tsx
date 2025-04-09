import {
  Box,
  Typography,
  TextField,
  Paper,
  Stack,
  Alert,
  useTheme,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Send } from '@mui/icons-material';
import useMessagingPage from '../../../hooks/useMessagingPage';
import MessageCard from '../messageCard';

const MessagingPage = () => {
  const { messages, newMessage, setNewMessage, handleSendMessage, error } = useMessagingPage();
  const theme = useTheme();

  return (
    <Box display='flex' flexDirection='column' height='90vh' p={2} margin={2}>
      <Paper
        elevation={3}
        sx={{
          bgcolor: theme.palette.primary.main,
          p: 2,
          textAlign: 'center',
        }}>
        <Typography sx={{ color: 'white' }} variant='h4'>
          Chat Room
        </Typography>
      </Paper>
      <Box flexGrow={1} overflow='auto' mt={2}>
        <Stack spacing={2}>
          {messages.map(message => (
            <MessageCard key={String(message._id)} message={message} />
          ))}
        </Stack>
      </Box>
      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Box mt={2} sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder='Type your message here'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          variant='outlined'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton color='primary' onClick={handleSendMessage}>
                    <Send />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default MessagingPage;
