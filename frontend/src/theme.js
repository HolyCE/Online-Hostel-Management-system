import { createTheme } from '@mui/material/styles';

import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#ffffff' : '#000000',
        light: isDark ? '#f5f5f5' : '#333333',
        dark: isDark ? '#e0e0e0' : '#000000',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#000000' : '#ffffff',
        paper: isDark ? '#0a0a0a' : '#f9fafb',
      },
      text: {
        primary: isDark ? '#ffffff' : '#111827',
        secondary: isDark ? '#a1a1aa' : '#6b7280',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontSize: '3rem', fontWeight: 600, letterSpacing: '-0.02em', '@media (min-width:600px)': { fontSize: '4rem' } },
      h2: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em', '@media (min-width:600px)': { fontSize: '3rem' } },
      h3: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.25rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            backgroundColor: isDark ? '#ffffff' : '#000000',
            color: isDark ? '#000000' : '#ffffff',
            boxShadow: 'none',
            border: '1px solid transparent',
            '&:hover': {
              backgroundColor: isDark ? '#f4f4f5' : '#333333',
              boxShadow: 'none',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            color: isDark ? '#ffffff' : '#000000',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.08)'}`,
            boxShadow: isDark ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
              borderRadius: '8px',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.4)',
              },
              '&.Mui-focused fieldset': {
                borderColor: isDark ? '#ffffff' : '#000000',
                borderWidth: '1px',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          },
        },
      },
    },
  });
};
