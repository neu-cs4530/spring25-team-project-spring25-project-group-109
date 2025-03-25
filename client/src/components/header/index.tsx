import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Button, TextField, Toolbar, Typography } from '@mui/material';
import useHeader from '../../hooks/useHeader';
import './index.css';
import useUserContext from '../../hooks/useUserContext';

/**
 * Header component that renders the main title and a search bar.
 * The search bar allows the user to input a query and navigate to the search results page
 * when they press Enter.
 */
const Header = () => {
  const { val, handleInputChange, handleKeyDown, handleSignOut } = useHeader();
  const { user: currentUser } = useUserContext();
  const navigate = useNavigate();
  return (
    <AppBar position='static' color='primary'>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant='h3' sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          Stack Overflow
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

        <Button variant='outlined' onClick={handleSignOut}>
          Log out
        </Button>
        <Button
          variant='outlined'
          onClick={() => {
            navigate(`/user/${currentUser.username}`);
          }}>
          View Profile
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
