import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        // Mock fetch
        setPayments([
            { _id: 'P1', reference: 'REF123456', student: 'John Doe', amount: 150000, status: 'success', date: new Date().toISOString() },
            { _id: 'P2', reference: 'REF789012', student: 'Jane Smith', amount: 100000, status: 'pending', date: new Date().toISOString() },
            { _id: 'P3', reference: 'REF345678', student: 'Bob Builder', amount: 250000, status: 'failed', date: new Date().toISOString() },
        ]);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">Payment Tracking</Typography>
                <Typography color="text.secondary">Monitor and verify student payments</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell>Reference</TableCell>
                            <TableCell>Student</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.map(p => (
                            <TableRow key={p._id} hover>
                                <TableCell sx={{ fontFamily: 'monospace' }}>{p.reference}</TableCell>
                                <TableCell>{p.student}</TableCell>
                                <TableCell>₦{p.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={p.status}
                                        color={p.status === 'success' ? 'success' : p.status === 'pending' ? 'warning' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default PaymentManagement;
