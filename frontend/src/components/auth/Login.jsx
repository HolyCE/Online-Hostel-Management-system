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
import './Login.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const schema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data) => {
    setApiError('');
    
    try {
      const result = await login(data.email, data.password);
      
      if (!result.success) {
        setApiError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
        setApiError('Cannot connect to server. Please make sure the backend is running on port 5000.');
      } else if (error.response) {
        setApiError(error.response.data?.message || 'Login failed. Check your credentials.');
      } else {
        setApiError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm" className="login-container">
      <Box className="login-box">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: '100%' }}
        >
          <Paper className="login-paper">
            <Box className="login-header">
              <Typography variant="h3" className="login-title">
                Welcome Back
              </Typography>
              <Typography variant="body1" className="login-subtitle">
                Sign in to manage your hostel experience
              </Typography>
            </Box>

            {apiError && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Alert severity="error" className="login-alert" onClose={() => setApiError('')}>
                  {apiError}
                </Alert>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <TextField
                fullWidth
                label="Email Address"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                className="login-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email className="input-icon" />
                    </InputAdornment>
                  ),
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
                className="login-input"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock className="input-icon" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={() => setShowPassword(!showPassword)} 
                        edge="end"
                        className="password-toggle"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box className="forgot-password">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                size="large"
                className="login-button"
              >
                {isSubmitting ? <CircularProgress size={26} color="inherit" /> : 'Log In'}
                {!isSubmitting && <LoginIcon className="button-icon" />}
              </Button>

              <Divider className="login-divider">
                <Typography variant="body2" className="divider-text">OR</Typography>
              </Divider>

              <Box className="register-link">
                <Typography variant="body1" className="register-text">
                  New to the hostel?{' '}
                  <Link to="/register" className="register-button">
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