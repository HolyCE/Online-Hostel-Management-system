import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    Box, Container, Typography, Grid, Paper, Divider,
    Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Chip, IconButton, Button, Avatar, MenuItem,
    Select, FormControl, InputLabel, TextField
} from '@mui/material';
import { CheckCircle, Pending, Comment, Build } from '@mui/icons-material';
import { ticketService } from '../../services/api';

const StaffDashboard = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignedTickets();
    }, []);

    const fetchAssignedTickets = async () => {
        try {
            setLoading(true);
            // const res = await ticketService.getAllTickets({ assignedTo: user._id });
            // setTickets(res.data.data);

            // Mocking for UI
            setTimeout(() => {
                setTickets([
                    { _id: 'T101', title: 'Leaking Pipe in Bathroom', room: { roomNumber: 'B204', blockName: 'Block B' }, student: { name: 'John Doe' }, category: 'Plumbing', priority: 'Urgent', status: 'Pending', createdAt: '2024-03-01T10:00:00Z' },
                    { _id: 'T102', title: 'AC not cooling', room: { roomNumber: 'A101', blockName: 'Block A' }, student: { name: 'Mike Smith' }, category: 'Electrical', priority: 'Normal', status: 'In Progress', createdAt: '2024-02-28T14:30:00Z' },
                    { _id: 'T103', title: 'Broken Window Lock', room: { roomNumber: 'C305', blockName: 'Block C' }, student: { name: 'Sarah Jones' }, category: 'Carpentry', priority: 'High', status: 'Resolved', createdAt: '2024-02-25T09:15:00Z' },
                ]);
                setLoading(false);
            }, 800);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            // await ticketService.updateTicketStatus(id, { status: newStatus });
            setTickets(tickets.map(t => t._id === id ? { ...t, status: newStatus } : t));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'resolved': return 'success';
            case 'in progress': return 'info';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case 'urgent': return 'error';
            case 'high': return 'warning';
            case 'normal': return 'info';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, minHeight: '80vh' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>Staff Portal</Typography>
                    <Typography color="text.secondary">Manage your assigned maintenance tasks</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}><Build /></Avatar>
                    <Typography variant="h6">{user?.name || 'Staff Member'}</Typography>
                </Box>
            </Box>

            <Grid container spacing={3} mb={4}>
                {['All Tickets', 'Pending', 'In Progress', 'Resolved'].map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Typography color="text.secondary" variant="body2" fontWeight="bold" textTransform="uppercase">{stat}</Typography>
                            <Typography variant="h3" fontWeight="bold" mt={1}>
                                {stat === 'All Tickets' ? tickets.length : tickets.filter(t => t.status.toLowerCase() === stat.toLowerCase()).length}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box p={3} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="h6" fontWeight="bold">Assigned Tasks</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell>Ticket ID</TableCell>
                                <TableCell>Room & Block</TableCell>
                                <TableCell>Issue Summary</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status & Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow><TableCell colSpan={6} align="center">No assigned tickets found.</TableCell></TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket._id} hover>
                                        <TableCell><Typography fontWeight="bold" color="primary">#{ticket._id}</Typography></TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="bold">{ticket.room?.roomNumber}</Typography>
                                            <Typography variant="caption" color="text.secondary">{ticket.room?.blockName}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{ticket.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">By {ticket.student?.name}</Typography>
                                        </TableCell>
                                        <TableCell><Chip label={ticket.category} size="small" variant="outlined" /></TableCell>
                                        <TableCell>
                                            <Chip label={ticket.priority} size="small" color={getPriorityColor(ticket.priority)} />
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 140 }}>
                                                <Select
                                                    value={ticket.status}
                                                    onChange={(e) => updateStatus(ticket._id, e.target.value)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        '& .MuiSelect-select': { py: 0.8 },
                                                        bgcolor: ticket.status === 'Resolved' ? 'success.light' : 'transparent',
                                                        color: ticket.status === 'Resolved' ? 'success.contrastText' : 'inherit'
                                                    }}
                                                >
                                                    <MenuItem value="Pending">Pending</MenuItem>
                                                    <MenuItem value="In Progress">In Progress</MenuItem>
                                                    <MenuItem value="Resolved">Resolved</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default StaffDashboard;
