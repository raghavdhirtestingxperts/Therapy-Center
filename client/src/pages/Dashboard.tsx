import React from 'react';
import { Typography, Grid, Card, CardContent, Button, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import Calendar from '@mui/icons-material/CalendarMonth';
import Users from '@mui/icons-material/People';
import Activity from '@mui/icons-material/Timeline';
import FileText from '@mui/icons-material/Description';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    const renderAdminDashboard = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <CardContent>
                        <Typography variant="h6">Total Therapies</Typography>
                        <Typography variant="h3">12</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                    <CardContent>
                        <Typography variant="h6">Active Doctors</Typography>
                        <Typography variant="h3">8</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CardContent>
                        <Typography variant="h6">Receptionists</Typography>
                        <Typography variant="h3">4</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    const renderPatientDashboard = () => (
        <Box>
            <Typography variant="h5" gutterBottom>My Appointments</Typography>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="body1">You have no upcoming appointments.</Typography>
                    <Button variant="contained" sx={{ mt: 2 }}>Book Now</Button>
                </CardContent>
            </Card>
        </Box>
    );

    const renderDoctorDashboard = () => (
        <Box>
            <Typography variant="h5" gutterBottom>Today's Schedule</Typography>
            <Card>
                <CardContent>
                    <Typography variant="body1">No sessions scheduled for today.</Typography>
                </CardContent>
            </Card>
        </Box>
    );

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Welcome, {user?.firstName}!
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mb={4}>
                Here is an overview of what's happening today.
            </Typography>

            {user?.role === 'Admin' && renderAdminDashboard()}
            {(user?.role === 'Patient' || user?.role === 'Guardian') && renderPatientDashboard()}
            {user?.role === 'Doctor' && renderDoctorDashboard()}
            {user?.role === 'Receptionist' && <Typography>Receptionist Dashboard coming soon...</Typography>}
        </Box>
    );
};

export default Dashboard;
