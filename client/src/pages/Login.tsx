import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Card, CardContent, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { email, password });
            login(response.data);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data || 'Login failed');
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f1f5f9">
            <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 3, borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold" color="primary">
                        Therapy Center
                    </Typography>
                    <Typography variant="body2" color="textSecondary" textAlign="center" mb={3}>
                        Welcome back! Please enter your details.
                    </Typography>
                    
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            variant="outlined"
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            size="large"
                            type="submit"
                            sx={{ mt: 3, py: 1.5, textTransform: 'none', fontSize: '1.1rem' }}
                        >
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Login;
