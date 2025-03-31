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
import { Link } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import useNotifications from '../../../hooks/useNotificationPage';

const NotificationsPage = () => {
  const { user } = useUserContext();
  const { notifications, loading, error, toggleSeen, filterByType, markAllAsSeen } =
    useNotifications(user.username);
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Tabs value={selectedType} onChange={handleTabChange}>
          <Tab label='All' value='all' />
          <Tab label='Follows' value='follow' />
          <Tab label='Answers' value='answer' />
          <Tab label='Comments' value='comment' />
          <Tab label='Upvotes' value='upvote' />
          <Tab label='Badges' value='badge' />
        </Tabs>

        <Button variant='contained' color='primary' onClick={markAllAsSeen}>
          Mark All as Seen
        </Button>
      </Box>

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
              {notification.link ? (
                <ListItemText
                  primary={
                    <Link
                      to={notification.link}
                      onClick={e => {
                        if (!notification.seen) {
                          toggleSeen(notification._id.toString());
                        }
                      }}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.textDecoration = 'underline';
                        e.currentTarget.style.color = 'primary';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.textDecoration = 'none';
                        e.currentTarget.style.color = 'inherit';
                      }}>
                      {notification.text}
                    </Link>
                  }
                  secondary={new Date(notification.createdAt).toLocaleDateString()}
                />
              ) : (
                <ListItemText
                  primary={notification.text}
                  secondary={new Date(notification.createdAt).toLocaleDateString()}
                />
              )}

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
