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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Assuming login logic will eventually hit context too
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
      <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, width: '100%', borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" gutterBottom sx={{ color: '#0a2351', fontWeight: 800 }}>
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to manage your hostel experience
              </Typography>
            </Box>

            {apiError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError('')}>
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
                  startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary' }} /></InputAdornment>,
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
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
                  startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 2 }
                }}
              />

              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ color: '#0a2351', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>
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
                  mt: 4, mb: 3, py: 1.5,
                  backgroundColor: '#0a2351',
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(10, 35, 81, 0.4)',
                  '&:hover': { backgroundColor: '#1a3a6e', transform: 'translateY(-2px)' },
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
                {!isSubmitting && <LoginIcon sx={{ ml: 1 }} />}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">OR</Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  New to the hostel?{' '}
                  <Link to="/register" style={{ color: '#0a2351', textDecoration: 'none', fontWeight: 'bold' }}>
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
