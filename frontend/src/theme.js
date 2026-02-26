import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0a2351', // Deep navy blue
      light: '#1a3a6e',
      dark: '#051023',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800', // Orange accent
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
    },
    warning: {
      main: '#ff9800',
      light: '#ffb74d',
      dark: '#f57c00',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '3rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#0a2351',
            },
          },
        },
      },
    },
  },
});

export default theme;
