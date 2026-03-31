import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, TextField, Button, Grid, Divider, Alert } from '@mui/material';
import api from '../services/api';

const DoctorFindings: React.FC = () => {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [selectedAppt, setSelectedAppt] = useState<any>(null);
    const [observations, setObservations] = useState('');
    const [recommendations, setRecommendations] = useState('');
    const [nextDate, setNextDate] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        // In a real app, doctorId would come from AuthContext
        const res = await api.get('/doctor/appointments?doctorId=1');
        setAppointments(res.data);
    };

    const handleSubmit = async () => {
        try {
            await api.post('/doctor/findings', {
                appointmentId: selectedAppt.appointmentId,
                observations,
                recommendations,
                nextSessionDate: nextDate
            });
            alert('Findings submitted successfully!');
            setSelectedAppt(null);
            fetchAppointments();
        } catch (err) {
            setError('Submission failed');
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Doctor's Findings</Typography>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Typography variant="h6" gutterBottom>Today's Sessions</Typography>
                    {appointments.map((appt) => (
                        <Card 
                            key={appt.appointmentId} 
                            sx={{ mb: 2, cursor: 'pointer', border: selectedAppt?.appointmentId === appt.appointmentId ? '2px solid #6366f1' : 'none' }}
                            onClick={() => setSelectedAppt(appt)}
                        >
                            <CardContent>
                                <Typography variant="body1" fontWeight="bold">Patient: {appt.patient.firstName} {appt.patient.lastName}</Typography>
                                <Typography variant="body2" color="textSecondary">Therapy: {appt.therapy.name}</Typography>
                                <Typography variant="body2" color="textSecondary">Time: {appt.startTime} - {appt.endTime}</Typography>
                                <Typography variant="caption" sx={{ color: appt.status === 'Completed' ? 'success.main' : 'warning.main' }}>
                                    Status: {appt.status}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Grid>

                <Grid item xs={12} md={8}>
                    {selectedAppt ? (
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Session with {selectedAppt.patient.firstName}</Typography>
                                <Divider sx={{ my: 2 }} />
                                
                                <TextField fullWidth label="Observations" multiline rows={4} sx={{ mb: 2 }} value={observations} onChange={(e) => setObservations(e.target.value)} />
                                <TextField fullWidth label="Recommendations" multiline rows={4} sx={{ mb: 2 }} value={recommendations} onChange={(e) => setRecommendations(e.target.value)} />
                                <TextField fullWidth type="date" label="Next Session Date" InputLabelProps={{ shrink: true }} sx={{ mb: 3 }} value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
                                
                                <Button variant="contained" fullWidth size="large" onClick={handleSubmit}>Submit Findings</Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Box display="flex" justifyContent="center" alignItems="center" height="200px" border="1px dashed #cbd5e1" borderRadius={2}>
                            <Typography color="textSecondary">Select an appointment to enter findings</Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default DoctorFindings;
