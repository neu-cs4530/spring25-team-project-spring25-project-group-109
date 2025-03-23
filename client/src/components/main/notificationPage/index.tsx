import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from '@mui/material';
import { NotificationType } from '@fake-stack-overflow/shared';
import useUserContext from '../../../hooks/useUserContext';
import useNotifications from '../../../hooks/useNotificationPage';

const NotificationsPage = () => {
  const { user } = useUserContext();
  const { notifications, loading, error, toggleSeen, filterByType } = useNotifications(
    user.username,
  );
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const handleTabChange = (_: React.SyntheticEvent, newValue: NotificationType | 'all') => {
    setSelectedType(newValue);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color='error'>{error}</Typography>;

  const displayedNotifications =
    selectedType === 'all' ? notifications : filterByType(selectedType);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant='h4' gutterBottom>
        Notifications
      </Typography>

      <Tabs value={selectedType} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
        <Tab label='All' value='all' />
        <Tab label='Follows' value='follow' />
        <Tab label='Answers' value='answer' />
        <Tab label='Comments' value='comment' />
        <Tab label='Badges' value='badge' />
      </Tabs>

      <List>
        {displayedNotifications.length > 0 ? (
          displayedNotifications.map(notification => (
            <ListItem
              key={notification._id.toString()}
              sx={{
                backgroundColor: notification.seen ? 'white' : '#f0f8ff',
                borderRadius: 1,
                mb: 1,
              }}>
              <ListItemText
                primary={notification.text}
                secondary={new Date(notification.createdAt).toLocaleDateString()}
              />
              <Button
                variant='outlined'
                size='small'
                onClick={() => toggleSeen(notification._id.toString())}>
                {notification.seen ? 'Mark as Unseen' : 'Mark as Seen'}
              </Button>
            </ListItem>
          ))
        ) : (
          <Typography>No notifications available.</Typography>
        )}
      </List>
    </Box>
  );
};

export default NotificationsPage;
