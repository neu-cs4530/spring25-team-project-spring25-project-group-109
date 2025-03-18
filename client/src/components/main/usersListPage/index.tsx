import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import { Box, List, Typography } from '@mui/material';
import UserCardView from './userCard';
import UsersListHeader from './header';
import useUsersListPage from '../../../hooks/useUsersListPage';
import { SafeDatabaseUser } from '../../../types/types';

/**
 * Interface representing the props for the UsersListPage component.
 * handleUserSelect - The function to handle the click event on the user card.
 */
interface UserListPageProps {
  handleUserSelect?: (user: SafeDatabaseUser) => void;
}

/**
 * UsersListPage component renders a page displaying a list of users
 * based on search content filtering.
 * It includes a header with a search bar.
 */
const UsersListPage = (props: UserListPageProps) => {
  const { userList, setUserFilter } = useUsersListPage();
  const { handleUserSelect = null } = props;
  const navigate = useNavigate();

  /**
   * Handles the click event on the user card.
   * If handleUserSelect is provided, it calls the handleUserSelect function.
   * Otherwise, it navigates to the user's profile page.
   */
  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    if (handleUserSelect) {
      handleUserSelect(user);
    } else if (user.username) {
      navigate(`/user/${user.username}`);
    }
  };
  return (
    <Box sx={{ padding: 3 }}>
      <UsersListHeader userCount={userList.length} setUserFilter={setUserFilter} />
      <List>
        {userList.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </List>
      {(!userList.length || userList.length === 0) && (
        <Typography variant='h6' align='center' sx={{ marginTop: 3 }}>
          No Users Found
        </Typography>
      )}
    </Box>
  );
};

export default UsersListPage;
