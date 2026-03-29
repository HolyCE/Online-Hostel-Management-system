import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Paper, Button, Divider,
    Chip, Avatar, CircularProgress, Alert, Dialog, DialogTitle,
    DialogContent, DialogContentText, DialogActions, List, ListItem,
    ListItemIcon, ListItemText, Backdrop, MuiAlert
} from '@mui/material';
import {
    ArrowBack, LocationOn, Bed, AttachMoney, People, Wc, CheckCircle,
    AcUnit, Wifi, Tv, Kitchen, LocalLaundryService, SquareFoot
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { roomService, paymentService } from '../../services/api';
import { PaystackButton } from 'react-paystack';

// Helper to map amenity strings to icons
const getAmenityIcon = (amenity) => {
    const cleanAmenity = amenity.toLowerCase();
    if (cleanAmenity.includes('ac')) return <AcUnit />;
    if (cleanAmenity.includes('wifi') || cleanAmenity.includes('internet')) return <Wifi />;
    if (cleanAmenity.includes('tv')) return <Tv />;
    if (cleanAmenity.includes('kitchen')) return <Kitchen />;
    if (cleanAmenity.includes('laundry')) return <LocalLaundryService />;
    return <CheckCircle />;
};

const RoomDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [room, setRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null); // 'success', 'waitlist', null
    const [paymentConfig, setPaymentConfig] = useState(null);

    useEffect(() => {
        fetchRoomDetails();
    }, [id]);

    const fetchRoomDetails = async () => {
        try {
            setLoading(true);
            const res = await roomService.getRoomById(id);
            setRoom(res.data.data || mockRoom); // Fallback to mock for testing UI
        } catch (err) {
            console.error('Failed to fetch room details:', err);
            // Mock data for UI development
            setRoom(mockRoom);
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        try {
            setActionLoading(true);
            setError(null);

            // In a real app, you would call:
            // const res = await roomService.applyForRoom({ roomId: id });

            // Simulating API delay
            setTimeout(() => {
                setActionLoading(false);
                setApplicationStatus('success'); // or 'waitlist'
            }, 1500);

        } catch (err) {
            setActionLoading(false);
            setError(err.response?.data?.message || 'Failed to apply for room.');
        }
    };

    const handleInitializePayment = async () => {
        try {
            setActionLoading(true);
            // const res = await paymentService.initializePayment({ roomId: room._id, amount: room.price });
            // setPaymentConfig(res.data.data);

            // Mocking initialize
            setTimeout(() => {
                setPaymentConfig({
                    reference: `TEST_${Math.floor(Math.random() * 1000000000)}`,
                    email: user?.email || 'student@example.com',
                    amount: room.price * 100, // Paystack expects amount in kobo
                    publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_sample'
                });
                setActionLoading(false);
            }, 1000);

        } catch (err) {
            setActionLoading(false);
            setError('Failed to initialize payment.');
        }
    };

    const finalizeApplication = () => {
        setApplyModalOpen(false);
        navigate('/dashboard');
    };

    const handlePaymentSuccess = (response) => {
        // Call verify endpoint here, then navigate
        // paymentService.verifyPayment(response.reference)
        console.log('Payment success:', response);
        navigate('/dashboard', { state: { paymentSuccess: true } });
    };

    if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
    if (!room) return <Alert severity="error">Room not found</Alert>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/rooms')}
                sx={{ mb: 3 }}
                color="inherit"
            >
                Back to Rooms
            </Button>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: 4, mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {/* Main Image Banner */}
                <Box
                    sx={{
                        height: 400,
                        width: '100%',
                        backgroundImage: `url(${room.images?.[0] || 'https://via.placeholder.com/1200x400?text=Room+Image'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative'
                    }}
                >
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)'
                    }} />
                    <Box sx={{ position: 'absolute', bottom: 30, left: 30, color: 'white' }}>
                        <Typography variant="h3" fontWeight="bold">{room.roomNumber}</Typography>
                        <Typography variant="h6" display="flex" alignItems="center">
                            <LocationOn sx={{ mr: 1 }} /> {room.blockName} Block
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={4} sx={{ p: 4 }}>
                    {/* Left Column: Details */}
                    <Grid item xs={12} md={8}>
                        <Box mb={4}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>About This Room</Typography>
                            <Typography color="text.secondary" paragraph lineHeight={1.8}>
                                {room.description || 'This premium room offers a comfortable and conducive environment for students. Ensure you book early as spaces are highly competitive. The room comes with standard amenities to make your stay memorable and comfortable.'}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 4 }} />

                        <Box>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>Amenities</Typography>
                            <Grid container spacing={2}>
                                {room.amenities?.map((amenity, idx) => (
                                    <Grid item xs={6} sm={4} key={idx}>
                                        <Box display="flex" alignItems="center" p={2} sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
                                            {getAmenityIcon(amenity)}
                                            <Typography ml={1.5} variant="body2" fontWeight="500">{amenity}</Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Right Column: Pricing & Actions */}
                    <Grid item xs={12} md={4}>
                        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, position: 'sticky', top: 24 }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>Price per session</Typography>
                            <Typography variant="h3" color="primary.main" fontWeight="bold" mb={3}>
                                ₦{room.price?.toLocaleString()}
                            </Typography>

                            <List sx={{ mb: 3 }}>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}><People color="primary" /></ListItemIcon>
                                    <ListItemText primary="Capacity" secondary={`${room.capacity} Person(s)`} />
                                </ListItem>
                                <ListItem disablePadding sx={{ mb: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}><Wc color="primary" /></ListItemIcon>
                                    <ListItemText primary="Gender Allowed" secondary={room.genderRestriction} />
                                </ListItem>
                            </List>

                            <Button
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 'bold' }}
                                onClick={() => setApplyModalOpen(true)}
                            >
                                Apply for Room
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Application Dialog */}
            <Dialog
                open={applyModalOpen}
                onClose={() => !actionLoading && setApplyModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
            >
                {!applicationStatus ? (
                    <>
                        <DialogTitle typography="h4" fontWeight="bold">Confirm Application</DialogTitle>
                        <DialogContent>
                            <DialogContentText paragraph>
                                You are about to apply for <strong>{room.roomNumber} ({room.blockName} Block)</strong>.
                            </DialogContentText>
                            <Box bgcolor="info.light" p={2} borderRadius={2} color="info.contrastText" mb={2}>
                                <Typography variant="body2">
                                    <strong>Note:</strong> If the room is already full, you will be placed on the waiting list.
                                    Fees are ₦{room.price.toLocaleString()} per session.
                                </Typography>
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ p: 3, pt: 0 }}>
                            <Button onClick={() => setApplyModalOpen(false)} disabled={actionLoading} color="inherit">
                                Cancel
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleApply}
                                disabled={actionLoading}
                                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                {actionLoading ? 'Processing...' : 'Confirm & Apply'}
                            </Button>
                        </DialogActions>
                    </>
                ) : applicationStatus === 'success' ? (
                    <Box textAlign="center" py={4} px={2}>
                        <CheckCircle color="success" sx={{ fontSize: 72, mb: 2 }} />
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Room Allocated!</Typography>
                        <Typography color="text.secondary" paragraph>
                            Congratulations! <strong>{room.roomNumber}</strong> has been allocated to you.
                            Please proceed to make your payment to secure the room within 48 hours.
                        </Typography>

                        {paymentConfig ? (
                            <Box mt={3}>
                                <PaystackButton
                                    {...paymentConfig}
                                    text="Pay Now with Paystack"
                                    onSuccess={handlePaymentSuccess}
                                    onClose={() => console.log('Payment modal closed')}
                                    className="paystack-button btn btn-primary w-100" // Requires custom css or global styles
                                />
                            </Box>
                        ) : (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                fullWidth
                                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                                onClick={handleInitializePayment}
                                disabled={actionLoading}
                            >
                                {actionLoading ? <CircularProgress size={24} color="inherit" /> : `Pay ₦${room.price.toLocaleString()} Now`}
                            </Button>
                        )}

                        <Button fullWidth variant="text" sx={{ mt: 2 }} onClick={finalizeApplication}>
                            Pay Later (Go to Dashboard)
                        </Button>
                    </Box>
                ) : null}
            </Dialog>
        </Container>
    );
};

// Mock data
const mockRoom = {
    _id: '1',
    roomNumber: 'A101',
    blockName: 'Block A',
    capacity: 2,
    price: 150000,
    genderRestriction: 'Male',
    description: 'A spacious double-occupancy room located on the ground floor. Features large windows for natural light, built-in wardrobes, and dedicated study desks.',
    amenities: ['Air Conditioning', 'High-Speed WiFi', 'Ensuite Bathroom', 'Study Desks', 'Wardrobe', 'Mini Fridge'],
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=1200']
};

export default RoomDetails;
