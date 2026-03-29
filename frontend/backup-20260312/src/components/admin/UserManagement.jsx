import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Chip, Avatar
} from '@mui/material';

const UserManagement = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        // Mock fetch
        setUsers([
            { _id: '1', name: 'John Doe', matricNumber: '20/1234', email: 'john@example.com', role: 'student', isActive: true },
            { _id: '2', name: 'Admin User', matricNumber: 'N/A', email: 'admin@example.com', role: 'admin', isActive: true },
            { _id: '3', name: 'Jane Smith', matricNumber: '21/5678', email: 'jane@example.com', role: 'student', isActive: false },
            { _id: '4', name: 'Tech Support', matricNumber: 'N/A', email: 'staff@example.com', role: 'staff', isActive: true },
        ]);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box mb={4}>
                <Typography variant="h4" fontWeight="bold">User Management</Typography>
                <Typography color="text.secondary">View and manage system users</Typography>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Matric No.</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user._id} hover>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar sx={{ width: 32, height: 32 }}>{user.name[0]}</Avatar>
                                        <Typography fontWeight="500">{user.name}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>{user.matricNumber}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={user.role} size="small" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.isActive ? 'Active' : 'Inactive'}
                                        color={user.isActive ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default UserManagement;
