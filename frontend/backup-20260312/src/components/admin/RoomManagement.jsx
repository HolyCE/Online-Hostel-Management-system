import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { roomService } from '../../services/api';

const RoomManagement = () => {
    const [rooms, setRooms] = useState([]);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        roomNumber: '',
        blockName: '',
        capacity: 2,
        price: 150000,
        genderRestriction: 'Any'
    });

    useEffect(() => {
        // Mock fetch
        setRooms([
            { _id: '1', roomNumber: 'A101', blockName: 'Block A', capacity: 2, price: 150000, genderRestriction: 'Male', status: 'Available' },
            { _id: '2', roomNumber: 'B205', blockName: 'Block B', capacity: 4, price: 100000, genderRestriction: 'Female', status: 'Occupied' },
        ]);
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        // mock save
        setRooms([...rooms, { _id: Date.now().toString(), ...formData, status: 'Available' }]);
        handleClose();
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" mb={4}>
                <Typography variant="h4" fontWeight="bold">Room Management</Typography>
                <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
                    Add New Room
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell>Room No.</TableCell>
                            <TableCell>Block</TableCell>
                            <TableCell>Capacity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Target Gender</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rooms.map(room => (
                            <TableRow key={room._id} hover>
                                <TableCell fontWeight="bold">{room.roomNumber}</TableCell>
                                <TableCell>{room.blockName}</TableCell>
                                <TableCell>{room.capacity}</TableCell>
                                <TableCell>₦{room.price.toLocaleString()}</TableCell>
                                <TableCell>{room.genderRestriction}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={room.status}
                                        color={room.status === 'Available' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" color="primary"><Edit /></IconButton>
                                    <IconButton size="small" color="error"><Delete /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Room</DialogTitle>
                <DialogContent dividers>
                    <Box component="form" sx={{ display: 'grid', gap: 2, pt: 1 }}>
                        <TextField
                            label="Room Number"
                            fullWidth
                            value={formData.roomNumber}
                            onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                        />
                        <TextField
                            label="Block Name"
                            fullWidth
                            value={formData.blockName}
                            onChange={(e) => setFormData({ ...formData, blockName: e.target.value })}
                        />
                        <TextField
                            label="Price (₦)"
                            type="number"
                            fullWidth
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                        <TextField
                            select
                            label="Capacity"
                            fullWidth
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                        >
                            {[1, 2, 3, 4].map(cap => <MenuItem key={cap} value={cap}>{cap} Persons</MenuItem>)}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={handleSubmit}>Save Room</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RoomManagement;
