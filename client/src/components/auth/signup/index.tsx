import React from 'react';
import './index.css';
import {
  Box,
  Button,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a signup form with username, password, and password confirmation inputs,
 * password visibility toggle, error handling, and a link to the login page.
 */
const Signup = () => {
  const {
    username,
    password,
    passwordConfirmation,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('signup');

  return (
    <div className='container'>
      <Typography variant='h1' sx={{ mb: 3 }}>
        Stack Overflow
      </Typography>
      <Box
        component='form'
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', width: 500, mb: 2 }}>
        <Typography variant='h6'>Please enter your username.</Typography>
        <TextField
          type='text'
          value={username}
          onChange={event => handleInputChange(event, 'username')}
          required
          id='username-input'
          label='Username'
          fullWidth
        />
        <Typography variant='h6'>Please enter your password.</Typography>
        <TextField
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={event => handleInputChange(event, 'password')}
          required
          id='password-input'
          label='Password'
          fullWidth
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={togglePasswordVisibility}
                    edge='end'>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          type={showPassword ? 'text' : 'password'}
          value={passwordConfirmation}
          onChange={event => handleInputChange(event, 'confirmPassword')}
          required
          id='confirm-password-input'
          label='Confirm Password'
          fullWidth
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={togglePasswordVisibility}
                  edge='end'>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button type='submit' variant='contained' sx={{ mt: 2, mb: 1 }}>
          Signup
        </Button>
      </Box>
      {err && (
        <Typography variant='body2' color='error.main' sx={{ fontWeight: 'bold', mt: 1, mb: 2 }}>
          {err}
        </Typography>
      )}
      <Link variant='body2' href='/'>
        Have an account? Log in here.
      </Link>
    </div>
  );
};

export default Signup;
