import './index.css';
import { Box, InputAdornment, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import useUserSearch from '../../../../hooks/useUserSearch';

/**
 * Interface representing the props for the UserHeader component.
 *
 * userCount - The number of users to be displayed in the header.
 * setUserFilter - A function that sets the search bar filter value.
 */
interface UserHeaderProps {
  userCount: number;
  setUserFilter: (search: string) => void;
}

/**
 * UsersListHeader component displays the header section for a list of users.
 * It includes the title and search bar to filter the user.
 * Username search is case-sensitive.
 *
 * @param userCount - The number of users displayed in the header.
 * @param setUserFilter - Function that sets the search bar filter value.
 */
const UsersListHeader = ({ userCount, setUserFilter }: UserHeaderProps) => {
  const { val, handleInputChange } = useUserSearch(setUserFilter);

  return (
    <Box sx={{ padding: 2 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}>
        <Typography variant='h5' sx={{ fontWeight: 'bold' }}>
          All Users
        </Typography>

        <TextField
          id='user_search_bar'
          placeholder='Search Usernames ...'
          type='text'
          value={val}
          onChange={handleInputChange}
          size='small'
          sx={{ width: 200, bgcolor: 'white', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant='body2' color='textSecondary'>
          {userCount} users
        </Typography>
      </Box>
    </Box>
  );
};

export default UsersListHeader;
