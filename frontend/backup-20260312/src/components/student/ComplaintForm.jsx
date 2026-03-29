import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Grid, Paper,
    Button, TextField, MenuItem, FormControl,
    InputLabel, Select, CircularProgress, Alert,
    Stepper, Step, StepLabel, LinearProgress
} from '@mui/material';
import {
    ReportProblem, UploadFile, CameraAlt,
    Build, ElectricalServices, WaterDrop, CheckCircle
} from '@mui/icons-material';
import { ticketService } from '../../services/api';
import './ComplaintForm.css';

const categories = [
    { value: 'Electrical', icon: <ElectricalServices /> },
    { value: 'Plumbing', icon: <WaterDrop /> },
    { value: 'Carpentry', icon: <Build /> },
    { value: 'Cleaning', icon: <ReportProblem /> },
    { value: 'Internet/WiFi', icon: <ReportProblem /> },
    { value: 'Other', icon: <ReportProblem /> },
];

const ComplaintForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        priority: 'Normal',
        description: '',
    });

    const steps = ['Issue Details', 'Additional Info', 'Confirmation'];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            // await ticketService.createTicket(formData);
            // Mocking the API response
            setTimeout(() => {
                setLoading(false);
                setSuccess(true);
                setActiveStep(3);
            }, 1500);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Failed to submit complaint. Please try again.');
        }
    };

    const resetForm = () => {
        setFormData({ title: '', category: '', priority: 'Normal', description: '' });
        setActiveStep(0);
        setSuccess(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            <Paper elevation={0} sx={{ p: 5, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                <Box textAlign="center" mb={5}>
                    <ReportProblem color="error" sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h4" fontWeight="800" gutterBottom>
                        Report an Issue
                    </Typography>
                    <Typography color="text.secondary">
                        Submit a maintenance request and our staff will attend to it promptly.
                    </Typography>
                </Box>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {activeStep === 0 && (
                    <Box component="form" className="form-step slide-in">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Issue Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Broken AC in my room"
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        name="category"
                                        value={formData.category}
                                        label="Category"
                                        onChange={handleChange}
                                    >
                                        {categories.map((cat) => (
                                            <MenuItem key={cat.value} value={cat.value}>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    {cat.icon} {cat.value}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        label="Priority"
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="Low">Low (Can wait a few days)</MenuItem>
                                        <MenuItem value="Normal">Normal (Needs attention soon)</MenuItem>
                                        <MenuItem value="Urgent">Urgent (Needs immediate attention)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" mt={2}>
                                    <Button
                                        variant="contained"
                                        onClick={handleNext}
                                        disabled={!formData.title || !formData.category || !formData.priority}
                                        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                                    >
                                        Next Step
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeStep === 1 && (
                    <Box component="form" onSubmit={handleSubmit} className="form-step slide-in">
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Detailed Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Please provide specific details about the issue to help our maintenance team..."
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        bgcolor: 'background.default',
                                        borderStyle: 'dashed',
                                        cursor: 'pointer',
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <CameraAlt color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                    <Typography variant="body1" gutterBottom>
                                        Drag and drop photos here, or click to browse
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Optional. PNG, JPG up to 5MB.
                                    </Typography>
                                    <Box mt={2}>
                                        <Button variant="outlined" startIcon={<UploadFile />} size="small">
                                            Upload Photos
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="space-between" mt={2}>
                                    <Button onClick={handleBack} variant="text" sx={{ px: 3 }}>
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        disabled={loading || !formData.description}
                                        sx={{ px: 4, py: 1.5, borderRadius: 2 }}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        Submit Request
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {activeStep === 3 && success && (
                    <Box textAlign="center" py={4} className="fade-in">
                        <CheckCircle color="success" sx={{ fontSize: 80, mb: 3 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Request Submitted Successfully!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Your ticket tracking ID is <strong>#TKT-{Math.floor(Math.random() * 10000)}</strong>.
                            Our team will review your request shortly. You can track its status in your dashboard.
                        </Typography>
                        <Box mt={4} display="flex" justifyContent="center" gap={2}>
                            <Button variant="outlined" onClick={resetForm} sx={{ borderRadius: 2 }}>
                                Submit Another
                            </Button>
                            <Button variant="contained" href="/dashboard" sx={{ borderRadius: 2 }}>
                                Go to Dashboard
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default ComplaintForm;
