import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Box, List, ListItem, Button, Collapse, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

/**
 * The SideBarNav component has four menu items: "Questions", "Tags", "Messaging", and "Users".
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  return (
    <Box
      sx={{
        width: 250,
        backgroundColor: '#f5f5f5',
        padding: 2,
        boxShadow: 2,
      }}>
      <List>
        <ListItem disablePadding>
          <NavLink
            to='/home'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent', // Background highlight for active item
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Questions</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/tags'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Tags</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/messaging'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth onClick={toggleOptions}>
              <Typography variant='body1'>Messaging</Typography>
              {showOptions ? <ExpandLess /> : <ExpandMore />}
            </Button>
          </NavLink>
        </ListItem>
        <Collapse in={showOptions} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            <ListItem disablePadding>
              <NavLink
                to='/messaging'
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#1976d2' : '#333',
                  backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '4px',
                })}>
                <Button fullWidth>
                  <Typography variant='body2' sx={{ pl: 4 }}>
                    Global Messages
                  </Typography>
                </Button>
              </NavLink>
            </ListItem>
            <ListItem disablePadding>
              <NavLink
                to='/messaging/direct-message'
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  color: isActive ? '#1976d2' : '#333',
                  backgroundColor: isActive ? '#e3f2fd' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '4px',
                })}>
                <Button fullWidth>
                  <Typography variant='body2' sx={{ pl: 4 }}>
                    Direct Messages
                  </Typography>
                </Button>
              </NavLink>
            </ListItem>
          </List>
        </Collapse>
        <ListItem disablePadding>
          <NavLink
            to='/users'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Users</Typography>
            </Button>
          </NavLink>
        </ListItem>
        <ListItem disablePadding>
          <NavLink
            to='/games'
            style={({ isActive }) => ({
              textDecoration: 'none',
              color: isActive ? '#1976d2' : '#333',
              backgroundColor: isActive ? '#e3f2fd' : 'transparent',
              padding: '8px 16px',
              borderRadius: '4px',
            })}>
            <Button fullWidth>
              <Typography variant='body1'>Games</Typography>
            </Button>
          </NavLink>
        </ListItem>
      </List>
    </Box>
  );
};

export default SideBarNav;
