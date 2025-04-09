import React from 'react';
import './index.css';
import { Avatar, Box, Card, Typography } from '@mui/material';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  return (
    <Card
      sx={{
        'display': 'flex',
        'padding': 2,
        'cursor': 'pointer',
        'boxShadow': 3,
        'borderRadius': 2,
        '&:hover': { boxShadow: 6 },
        'margin': 2,
      }}
      onClick={() => handleUserCardViewClickHandler(user)}>
      <Avatar
        src={user.profilePhoto}
        alt={`${user.username}'s profile`}
        sx={{ width: 56, height: 56, marginRight: 2 }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}>
        <Typography variant='h6' component='div' sx={{ fontWeight: 'bold' }}>
          {user.username}
        </Typography>
        <Typography variant='body2' color='textSecondary'>
          Joined: {new Date(user.dateJoined).toLocaleDateString()}
        </Typography>
      </Box>
    </Card>
  );
};

export default UserCardView;
