import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Plus from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Trash from '@mui/icons-material/Delete';
import api from '../services/api';

const TherapyManagement: React.FC = () => {
    const [therapies, setTherapies] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [currentTherapy, setCurrentTherapy] = useState<any>({ name: '', description: '', durationMinutes: 30, cost: 0 });

    useEffect(() => {
        fetchTherapies();
    }, []);

    const fetchTherapies = async () => {
        const res = await api.get('/admin/therapies');
        setTherapies(res.data);
    };

    const handleSave = async () => {
        if (currentTherapy.therapyId) {
            await api.put(`/admin/therapies/${currentTherapy.therapyId}`, currentTherapy);
        } else {
            await api.post('/admin/therapies', currentTherapy);
        }
        setOpen(false);
        fetchTherapies();
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Therapy Management</Typography>
                <Button variant="contained" startIcon={<Plus />} onClick={() => { setCurrentTherapy({ name: '', description: '', durationMinutes: 30, cost: 0 }); setOpen(true); }}>
                    Add Therapy
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Duration (min)</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {therapies.map((t) => (
                            <TableRow key={t.therapyId}>
                                <TableCell>{t.name}</TableCell>
                                <TableCell>{t.description}</TableCell>
                                <TableCell>{t.durationMinutes}</TableCell>
                                <TableCell>${t.cost}</TableCell>
                                <TableCell>
                                    <Button size="small" startIcon={<Edit />} onClick={() => { setCurrentTherapy(t); setOpen(true); }}>Edit</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{currentTherapy.therapyId ? 'Edit Therapy' : 'Add Therapy'}</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Name" sx={{ mt: 2 }} value={currentTherapy.name} onChange={(e) => setCurrentTherapy({...currentTherapy, name: e.target.value})} />
                    <TextField fullWidth label="Description" sx={{ mt: 2 }} multiline rows={3} value={currentTherapy.description} onChange={(e) => setCurrentTherapy({...currentTherapy, description: e.target.value})} />
                    <Box display="flex" gap={2} mt={2}>
                        <TextField fullWidth type="number" label="Duration (min)" value={currentTherapy.durationMinutes} onChange={(e) => setCurrentTherapy({...currentTherapy, durationMinutes: parseInt(e.target.value)})} />
                        <TextField fullWidth type="number" label="Cost ($)" value={currentTherapy.cost} onChange={(e) => setCurrentTherapy({...currentTherapy, cost: parseFloat(e.target.value)})} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TherapyManagement;
