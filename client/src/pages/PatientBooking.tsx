import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, MenuItem, TextField, CircularProgress, Alert } from '@mui/material';
import api from '../services/api';

const PatientBooking: React.FC = () => {
    const [therapies, setTherapies] = useState<any[]>([]);
    const [doctors, setDoctors] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedTherapy, setSelectedTherapy] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [therapiesRes, doctorsRes] = await Promise.all([
                    api.get('/admin/therapies'),
                    api.get('/admin/doctors')
                ]);
                setTherapies(therapiesRes.data);
                setDoctors(doctorsRes.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDoctorChange = async (doctorId: string) => {
        setSelectedDoctor(doctorId);
        if (doctorId) {
            try {
                const slotsRes = await api.get(`/doctor/availability/${doctorId}`);
                setSlots(slotsRes.data);
            } catch (err) {
                setError('Failed to load availability');
            }
        }
    };

    const handleBook = async (slotId: number) => {
        try {
            const slot = slots.find(s => s.slotId === slotId);
            await api.post('/patient/book', {
                doctorId: parseInt(selectedDoctor),
                therapyId: parseInt(selectedTherapy),
                appointmentDate: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                patientId: 1 // Replace with actual patient ID from context
            });
            alert('Booking successful!');
            // Refresh slots
            handleDoctorChange(selectedDoctor);
        } catch (err) {
            setError('Booking failed');
        }
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">Book an Appointment</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Select Therapy"
                        value={selectedTherapy}
                        onChange={(e) => setSelectedTherapy(e.target.value)}
                    >
                        {therapies.map((t) => (
                            <MenuItem key={t.therapyId} value={t.therapyId}>
                                {t.name} - ${t.cost}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        select
                        fullWidth
                        label="Select Doctor"
                        value={selectedDoctor}
                        onChange={(e) => handleDoctorChange(e.target.value)}
                    >
                        {doctors.map((d) => (
                            <MenuItem key={d.doctorId} value={d.doctorId}>
                                Dr. {d.user.firstName} {d.user.lastName} ({d.specialization})
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            {selectedDoctor && (
                <Box mt={4}>
                    <Typography variant="h6" gutterBottom>Available Slots</Typography>
                    <Grid container spacing={2}>
                        {slots.length === 0 ? (
                            <Typography sx={{ ml: 2 }}>No available slots for this doctor.</Typography>
                        ) : (
                            slots.map((slot) => (
                                <Grid item key={slot.slotId} xs={12} sm={6} md={3}>
                                    <Card variant="outlined">
                                        <CardContent>
                                            <Typography variant="body1" fontWeight="bold">
                                                {new Date(slot.date).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                {slot.startTime} - {slot.endTime}
                                            </Typography>
                                            <Button 
                                                variant="outlined" 
                                                fullWidth 
                                                sx={{ mt: 1 }}
                                                onClick={() => handleBook(slot.slotId)}
                                                disabled={!selectedTherapy}
                                            >
                                                Book This Slot
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))
                        )}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

export default PatientBooking;
