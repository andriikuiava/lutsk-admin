import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import DataDisplay from '../components/DataDisplay';
import TourForm from '../components/forms/TourForm';
import { tours } from '../api/client';
import type { Tour } from '../types/api';

export default function Tours() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [toursList, setToursList] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const response = await tours.getAll();
      setToursList(response.data);
    } catch (error) {
      console.error('Error loading tours:', error);
      setError('Failed to load tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await tours.delete(id);
      setToursList(prev => prev.filter(tour => tour.id !== id));
      setSuccess('Tour deleted successfully');
    } catch (error) {
      console.error('Error deleting tour:', error);
      setError('Failed to delete tour');
      throw error;
    }
  };

  const handleSubmit = async (data: Partial<Tour>) => {
    try {
      const tourData = {
        title: data.title || '',
        description: data.description || '',
        coverImage: data.coverImage || '',
        duration: data.duration || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        startingAddress: data.startingAddress || '',
        stops: data.stops || [],
      };
      const response = await tours.create(tourData);
      await loadTours();
      setShowCreate(false);
      setSuccess('Tour created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tour');
    }
  };

  const fetchFullDetails = async (id: string) => {
    const response = await tours.getById(id);
    return response.data;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tours
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : 'Create Tour'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <TourForm onSubmit={handleSubmit} />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Tours List"
          data={toursList}
          onDelete={handleDelete}
          getItemTitle={(tour: Tour) => tour.title}
          getItemSubtitle={(tour: Tour) => `Product ID: ${tour.productId}, ${tour.stopsCount} stop(s)`}
          getItemDetails={(tour: Tour) => ({
            ID: tour.id,
            Description: tour.description,
            Duration: tour.duration,
            'Cover Image': tour.coverImage,
            'Date Published': new Date(tour.datePublished).toLocaleString(),
            'Starting Address': tour.startingAddress,
            'Coordinates': `${tour.latitude}, ${tour.longitude}`,
            Stops: tour.stops || [],
          })}
          fetchFullDetails={fetchFullDetails}
        />
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 