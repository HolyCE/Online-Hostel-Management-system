import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null,
      });
    }
    // Clear API error when user types
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      // Get API URL from environment or use default
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem('token', response.data.token);
        
        // Optional: Save user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Show success message briefly
        setLoading(false);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setApiError(response.data.message || 'Login failed');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.code === 'ECONNREFUSED') {
        setApiError('Cannot connect to server. Please make sure the backend is running.');
      } else if (error.response) {
        // The request was made and the server responded with a status code outside of 2xx
        setApiError(error.response.data?.message || 'Login failed. Please check your credentials.');
      } else if (error.request) {
        // The request was made but no response was received
        setApiError('No response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request
        setApiError('An error occurred. Please try again.');
      }
      
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: '#0a2351', fontWeight: 'bold' }}>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Sign in to continue to your account
            </Typography>
          </Box>

          {apiError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#0a2351' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#0a2351',
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              margin="normal"
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#0a2351' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Link
                to="/forgot-password"
                style={{
                  color: '#0a2351',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#0a2351',
                '&:hover': {
                  backgroundColor: '#1a3a6e',
                },
                '&:disabled': {
                  backgroundColor: '#cccccc',
                },
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
              {!loading && <LoginIcon sx={{ ml: 1 }} />}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="textSecondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#0a2351',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
