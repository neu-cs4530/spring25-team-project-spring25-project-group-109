import './index.css';
import {
  Button,
  TextField,
  Typography,
  Link,
  Box,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');

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
        <Button type='submit' variant='contained' sx={{ mt: 2, mb: 1 }}>
          Submit
        </Button>
      </Box>
      {err && (
        <Typography variant='body2' color='error.main' sx={{ fontWeight: 'bold', mt: 1, mb: 2 }}>
          {err}
        </Typography>
      )}
      <Link variant='body2' href='/signup'>
        Don&apos;t have an account? Sign up here.
      </Link>
    </div>
  );
};

export default Login;
