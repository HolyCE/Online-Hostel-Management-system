import React, { useState } from 'react';
import {
  Container, Paper, TextField, Button, Typography, Box, Alert,
  InputAdornment, IconButton, Divider, Stepper, Step, StepLabel,
  Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
  Grid, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock, Phone, School } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const steps = ['Personal Info', 'Account Details', 'Review'];

const step1Schema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phoneNumber: yup.string().required('Phone number is required'),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
});

const step2Schema = yup.object().shape({
  matricNumber: yup.string().required('Matric number is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
});

const formVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.4 } }
};

const Register = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const { control, handleSubmit, trigger, getValues, watch, formState: { errors } } = useForm({
    resolver: yupResolver(activeStep === 0 ? step1Schema : (activeStep === 1 ? step2Schema : null)),
    mode: 'onChange',
    defaultValues: {
      name: '', email: '', phoneNumber: '', gender: '',
      matricNumber: '', password: '', confirmPassword: '', agreeToTerms: false
    }
  });

  const agreeToTerms = watch('agreeToTerms');

  const handleNext = async () => {
    let isValid = false;
    if (activeStep === 0) isValid = await trigger(['name', 'email', 'phoneNumber', 'gender']);
    else if (activeStep === 1) isValid = await trigger(['matricNumber', 'password', 'confirmPassword']);

    if (isValid) setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const onSubmitFinal = async (data) => {
    if (!data.agreeToTerms) return;
    setIsSubmittingForm(true);
    setApiError('');
    try {
      const payload = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        matricNumber: data.matricNumber,
        password: data.password,
        role: 'student' // default role for public registration
      };
      const response = await axios.post(`${API_URL}/auth/register`, payload);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      } else {
        setApiError(response.data.message || 'Registration failed');
      }
    } catch (error) {
      setApiError(error.response?.data?.message || 'Registration encountered an error. Please check your network.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div key="step1" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <Controller name="name" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Full Name" error={!!errors.name} helperText={errors.name?.message} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Person sx={{ color: 'text.secondary' }} /></InputAdornment>) }} />
            )} />
            <Controller name="email" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="email" label="Email Address" error={!!errors.email} helperText={errors.email?.message} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ color: 'text.secondary' }} /></InputAdornment>) }} />
            )} />
            <Controller name="phoneNumber" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type="tel" label="Phone Number" error={!!errors.phoneNumber} helperText={errors.phoneNumber?.message} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><Phone sx={{ color: 'text.secondary' }} /></InputAdornment>) }} />
            )} />
            <FormControl component="fieldset" margin="normal" error={!!errors.gender}>
              <FormLabel component="legend">Gender</FormLabel>
              <Controller name="gender" control={control} render={({ field }) => (
                <RadioGroup row {...field}>
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                </RadioGroup>
              )} />
              {errors.gender && <Typography variant="caption" color="error">{errors.gender.message}</Typography>}
            </FormControl>
          </motion.div>
        );
      case 1:
        return (
          <motion.div key="step2" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <Controller name="matricNumber" control={control} render={({ field }) => (
              <TextField {...field} fullWidth label="Matriculation/Student Number" error={!!errors.matricNumber} helperText={errors.matricNumber?.message} margin="normal" InputProps={{ startAdornment: (<InputAdornment position="start"><School sx={{ color: 'text.secondary' }} /></InputAdornment>) }} />
            )} />
            <Controller name="password" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type={showPassword ? 'text' : 'password'} label="Password" error={!!errors.password} helperText={errors.password?.message} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>, endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
            )} />
            <Controller name="confirmPassword" control={control} render={({ field }) => (
              <TextField {...field} fullWidth type={showConfirmPassword ? 'text' : 'password'} label="Confirm Password" error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} margin="normal" InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary' }} /></InputAdornment>, endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
            )} />
          </motion.div>
        );
      case 2:
        const values = getValues();
        return (
          <motion.div key="step3" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <Typography variant="h6" gutterBottom color="primary">Review Your Information</Typography>
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: 'background.default' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Typography variant="subtitle2" color="text.secondary">Full Name</Typography><Typography variant="body1" fontWeight="medium">{values.name}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="subtitle2" color="text.secondary">Email</Typography><Typography variant="body1" fontWeight="medium">{values.email}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="subtitle2" color="text.secondary">Phone Number</Typography><Typography variant="body1" fontWeight="medium">{values.phoneNumber}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="subtitle2" color="text.secondary">Gender</Typography><Typography variant="body1" fontWeight="medium" textTransform="capitalize">{values.gender}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="subtitle2" color="text.secondary">Matric Number</Typography><Typography variant="body1" fontWeight="medium">{values.matricNumber}</Typography></Grid>
              </Grid>
            </Paper>
            <Controller name="agreeToTerms" control={control} render={({ field }) => (
              <FormControlLabel control={<Radio checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />} label="I agree to the Hostel Terms and Conditions" />
            )} />
          </motion.div>
        );
      default: return null;
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, mb: 8 }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
            <Typography variant="h3" align="center" gutterBottom sx={{ color: '#0a2351', fontWeight: 800 }}>Create Account</Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>Join our modern hostel community today</Typography>

            <Stepper activeStep={activeStep} sx={{ mb: 5, display: { xs: 'none', sm: 'flex' } }}>
              {steps.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            {apiError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setApiError('')}>{apiError}</Alert>}

            <Box sx={{ minHeight: 300 }}>
              <AnimatePresence mode="wait">
                {renderStepContent(activeStep)}
              </AnimatePresence>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0 || isSubmittingForm} sx={{ color: '#0a2351', borderColor: '#0a2351', px: 4, py: 1, borderRadius: 2 }}>Back</Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit(onSubmitFinal)} disabled={!agreeToTerms || isSubmittingForm} sx={{ backgroundColor: '#0a2351', px: 4, py: 1, borderRadius: 2, '&:hover': { backgroundColor: '#1a3a6e' } }}>
                  {isSubmittingForm ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext} sx={{ backgroundColor: '#0a2351', px: 4, py: 1, borderRadius: 2, '&:hover': { backgroundColor: '#1a3a6e' } }}>Next</Button>
              )}
            </Box>

            <Divider sx={{ my: 4 }}><Typography variant="body2" color="text.secondary">OR</Typography></Divider>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#0a2351', textDecoration: 'none', fontWeight: 'bold' }}>Sign in here</Link>
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default Register;
