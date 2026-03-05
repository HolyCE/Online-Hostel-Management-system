import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  InputAdornment, IconButton, Divider, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming login logic will eventually hit context too
  const { mode } = useThemeContext();
  const isDark = mode === 'dark';
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Mock fallback routing based on role
        const role = response.data.user?.role;
        if (role === 'admin') navigate('/admin');
        else if (role === 'staff') navigate('/staff/dashboard');
        else navigate('/dashboard');
      } else {
        setApiError(response.data.message || 'Login failed');
      }
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        setApiError('Cannot connect to server. Ensure the backend is running.');
      } else if (error.response) {
        setApiError(error.response.data?.message || 'Login failed. Check your credentials.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 10, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              width: '100%',
              borderRadius: 3,
              bgcolor: isDark ? '#171717' : '#f5f5f5',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)'}`,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Typography variant="h3" gutterBottom sx={{ color: isDark ? '#ffffff' : '#000000', fontWeight: 800, letterSpacing: '-0.02em' }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? '#a1a1aa' : '#6b7280' }}>
                Sign in to manage your hostel experience
              </Typography>
            </Box>

            {apiError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }} onClose={() => setApiError('')}>
                  {apiError}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Email sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} /></InputAdornment>,
                }}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                margin="normal"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 1 }}
              />

              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ color: isDark ? '#ffffff' : '#000000', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, opacity: 0.8 }}>
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                size="large"
                sx={{
                  mt: 5, mb: 3, py: 1.8,
                  backgroundColor: isDark ? '#ffffff' : '#000000',
                  color: isDark ? '#000000' : '#ffffff',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  border: '1px solid transparent',
                  '&:hover': { backgroundColor: isDark ? '#f4f4f5' : '#333333', transform: 'translateY(-1px)' },
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
                {!isSubmitting && <LoginIcon sx={{ ml: 1, fontSize: '1.2rem' }} />}
              </Button>

              <Divider sx={{ my: 4, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <Typography variant="body2" sx={{ color: isDark ? '#a1a1aa' : '#6b7280' }}>OR</Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ color: isDark ? '#a1a1aa' : '#6b7280' }}>
                  New to the hostel?{' '}
                  <Link to="/register" style={{ color: isDark ? '#ffffff' : '#000000', textDecoration: 'none', fontWeight: 600 }}>
                    Create an account
                  </Link>
                </Typography>
              </Box>
            </form>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Login;
