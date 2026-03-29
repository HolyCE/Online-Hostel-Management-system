import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import PaystackPayment from './PaystackPayment';
import api from '../../services/api';

const steps = ['Enter Details', 'Make Payment', 'Confirmation'];

const PaymentPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState(50000);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentRef, setPaymentRef] = useState('');

  const handlePaymentSuccess = async (reference) => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/verify/${reference.reference}`);
      if (response.data.success) {
        setPaymentRef(reference.reference);
        setActiveStep(2);
      }
    } catch (err) {
      setError('Payment verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setActiveStep(1);
  };

  const handleBack = () => {
    setActiveStep(0);
    setError('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Make Payment
        </Typography>

        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Box sx={{ mb: 2, color: 'red', backgroundColor: '#ffeeee', p: 2 }}>
            {error}
          </Box>
        )}

        {activeStep === 0 && (
          <Box>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Amount (₦)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              margin="normal"
              required
            />
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={handleNext}
                style={{
                  backgroundColor: '#0a2351',
                  color: 'white',
                  padding: '10px 30px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Proceed to Payment
              </button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <PaystackPayment
              email={email}
              amount={amount}
              metadata={{
                custom_fields: [
                  {
                    display_name: "Payment For",
                    variable_name: "payment_for",
                    value: "Hostel Accommodation"
                  }
                ]
              }}
              onSuccess={handlePaymentSuccess}
              onClose={handleBack}
            />
            <Box sx={{ mt: 2 }}>
              <button
                onClick={handleBack}
                style={{
                  backgroundColor: '#666',
                  color: 'white',
                  padding: '8px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box sx={{ 
              backgroundColor: '#d4edda', 
              color: '#155724', 
              p: 2, 
              borderRadius: '5px',
              mb: 2 
            }}>
              Payment Successful!
            </Box>
            <Typography variant="body1" gutterBottom>
              Your payment reference: <strong>{paymentRef}</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary">
              A receipt has been sent to your email.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentPage;
