import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import './index.css';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import FakeStackOverflow from './components/fakestackoverflow';
import { FakeSOSocket } from './types/types';

const container = document.getElementById('root');

const theme = createTheme({
  palette: {
    primary: {
      main: '#214F4B',
    },
    secondary: {
      main: '#ABC8A2',
    },
    background: {
      default: '#f5f5f5',
    },
    error: {
      main: '#f44336',
    },
    success: {
      main: '#4caf50',
    },
    grey: {
      500: '#6c757d',
    },
  },
  typography: {
    fontFamily: '"Roboto", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.45,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },

    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },

    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.45,
    },

    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      textTransform: 'uppercase',
    },

    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.35,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      lineHeight: 1.3,
    },
  },
  spacing: 8, // Default spacing unit
  breakpoints: {
    values: {
      xs: 0, // Small screens (phones)
      sm: 600, // Small devices (tablets)
      md: 960, // Medium devices (laptops)
      lg: 1280, // Large devices (desktops)
      xl: 1920, // Extra large devices (large screens)
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Customize the button border radius
          textTransform: 'none', // Prevent text from being uppercased
        },
        outlined: {
          'backgroundColor': '#FFFFFF',
          'color': '#214F4B',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: 'black', // Default text color
        },
        h1: { color: '#214F4B' },
        h2: { color: '#214F4B' },
        h3: { color: '#FFFFFF' },
        h4: { color: '#214F4B' },
        h5: { color: '#214F4B' },
        h6: { color: '#666666' },
      },
    },
  },
});

const App = () => {
  const [socket, setSocket] = useState<FakeSOSocket | null>(null);

  const serverURL = process.env.REACT_APP_SERVER_URL;

  if (serverURL === undefined) {
    throw new Error("Environment variable 'REACT_APP_SERVER_URL' must be defined");
  }

  useEffect(() => {
    if (!socket) {
      setSocket(io(serverURL));
    }

    return () => {
      if (socket !== null) {
        socket.disconnect();
      }
    };
  }, [socket, serverURL]);

  return (
    <Router>
      <FakeStackOverflow socket={socket} />
    </Router>
  );
};

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>,
  );
}
