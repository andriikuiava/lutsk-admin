import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TourForm from '../components/forms/TourForm';
import { tours } from '../api/client';
import type { Tour } from '../types/api';

export default function AddTour() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Partial<Tour>) => {
    try {
      await tours.create(data);
      navigate('/tours');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tour');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add New Tour
      </Typography>

      <TourForm onSubmit={handleSubmit} />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 