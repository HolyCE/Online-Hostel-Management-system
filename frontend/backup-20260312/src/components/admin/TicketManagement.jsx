import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

const TicketManagement = () => {
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        // Mock fetch
        setTickets([
            { _id: 'T1', title: 'Broken Light', student: 'John Doe', category: 'Electrical', status: 'Pending', createdAt: new Date().toISOString() },
            { _id: 'T2', title: 'Leaking Sink', student: 'Jane Smith', category: 'Plumbing', status: 'In Progress', createdAt: new Date().toISOString() },
        ]);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Maintenance Tickets</Typography>
                <Typography color="text.secondary">Track and resolve student complaints</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Issue Title</TableCell>
                            <TableCell>Reported By</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map(t => (
                            <TableRow key={t._id} hover>
                                <TableCell fontWeight="bold">#{t._id}</TableCell>
                                <TableCell>{t.title}</TableCell>
                                <TableCell>{t.student}</TableCell>
                                <TableCell><Chip label={t.category} size="small" variant="outlined" /></TableCell>
                                <TableCell>
                                    <Chip
                                        label={t.status}
                                        color={t.status === 'Pending' ? 'warning' : 'info'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(t.createdAt).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default TicketManagement;
