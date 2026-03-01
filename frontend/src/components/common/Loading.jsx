import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ color: '#0a2351' }} />
      <Typography variant="h6" sx={{ mt: 2, color: '#666' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default Loading;
