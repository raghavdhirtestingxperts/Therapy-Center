import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Button, TextField, Grid, Divider, Alert } from '@mui/material';
import CreditCard from '@mui/icons-material/CreditCard';
import ShieldCheck from '@mui/icons-material/VerifiedUser';
import api from '../services/api';

const PaymentGateway: React.FC = () => {
    const [amount, setAmount] = useState('150.00'); // Example amount
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        try {
            await api.post('/payment/process', {
                appointmentId: 1, // Example
                amount: parseFloat(amount),
                paymentMethod: 'Credit Card'
            });
            setSuccess(true);
        } catch (err) {
            alert('Payment failed');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" mt={10}>
                <ShieldCheck sx={{ fontSize: 80, color: '#10b981' }} />
                <Typography variant="h4" fontWeight="bold" mt={2}>Payment Successful!</Typography>
                <Typography color="textSecondary" mt={1}>Your transaction has been processed.</Typography>
                <Button variant="contained" sx={{ mt: 4 }} onClick={() => window.location.href = '/'}>Go to Dashboard</Button>
            </Box>
        );
    }

    return (
        <Box maxWidth={600} mx="auto">
            <Typography variant="h4" fontWeight="bold" gutterBottom>Checkout</Typography>
            
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>Order Summary</Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>Therapy Session</Typography>
                        <Typography fontWeight="bold">${amount}</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="space-between">
                        <Typography variant="h6">Total</Typography>
                        <Typography variant="h6" color="primary">${amount}</Typography>
                    </Box>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                        <CreditCard sx={{ fontSize: 20, mr: 1 }} /> Payment Details
                    </Typography>
                    <TextField fullWidth label="Card Number" placeholder="**** **** **** ****" sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Expiry Date" placeholder="MM/YY" />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="CVV" placeholder="***" type="password" />
                        </Grid>
                    </Grid>
                    <Button 
                        variant="contained" 
                        fullWidth 
                        size="large" 
                        sx={{ mt: 4, py: 1.5 }} 
                        onClick={handlePayment}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : `Pay $${amount}`}
                    </Button>
                    <Typography variant="caption" color="textSecondary" textAlign="center" display="block" mt={2}>
                        Secure payment powered by TherapyCenter Gateway
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PaymentGateway;
