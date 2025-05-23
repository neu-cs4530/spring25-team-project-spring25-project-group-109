import { useNavigate } from 'react-router-dom';
import { AppBar, Badge, Button, IconButton, TextField, Toolbar, Typography } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useHeader from '../../hooks/useHeader';
import useUserContext from '../../hooks/useUserContext';
import useNotifications from '../../hooks/useNotificationPage';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  const { notifications } = useNotifications(currentUser.username);
  const unseenCount = notifications.filter(n => !n.seen).length;

  return (
    <AppBar position='static' color='primary'>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Typography
          variant='h3'
          sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }}
          onClick={() => navigate('/home')}>
          Threadscape
        </Typography>

        <TextField
          id='searchBar'
          placeholder='Search'
          type='text'
          value={val}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          size='small'
          sx={{ width: 200, bgcolor: 'white', borderRadius: 1 }}
        />

        <IconButton onClick={() => navigate('/notifications')} color='inherit'>
          <Badge badgeContent={unseenCount} color='error' invisible={unseenCount <= 0}>
            <NotificationsIcon />
          </Badge>
        </IconButton>

        <Button
          variant='outlined'
          onClick={() => {
            navigate(`/user/${currentUser.username}`);
          }}>
          View Profile
        </Button>
        <Button variant='outlined' onClick={handleSignOut}>
          Log out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
