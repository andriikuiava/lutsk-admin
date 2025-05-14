import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import DataDisplay from '../components/DataDisplay';
import TourForm from '../components/forms/TourForm';
import { tours } from '../api/client';
import type { Tour } from '../types/api';

export default function Tours() {
  const [showCreate, setShowCreate] = useState(false);
  const [toursList, setToursList] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const navigate = useNavigate();

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

  const handleEdit = async (id: string) => {
    try {
      const response = await tours.getById(id);
      setEditingTour(response.data);
      setShowCreate(true);
    } catch (error) {
      console.error('Error loading tour details:', error);
      setError('Failed to load tour details');
    }
  };

  const handleSubmit = async (data: Partial<Tour>) => {
    try {
      const tourData = {
        title: data.title || '',
        description: data.description || '',
        duration: data.duration || '',
        coverImage: data.coverImage || '',
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        startingAddress: data.startingAddress || '',
        stops: data.stops || [],
      };

      if (editingTour) {
        await tours.update(editingTour.id, tourData);
        setSuccess('Tour updated successfully');
      } else {
        await tours.create(tourData);
        setSuccess('Tour created successfully');
      }
      await loadTours();
      setShowCreate(false);
      setEditingTour(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save tour');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditingTour(null);
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
          onClick={() => {
            setEditingTour(null);
            setShowCreate(!showCreate);
          }}
        >
          {showCreate ? 'Cancel' : 'Create Tour'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <TourForm 
            onSubmit={handleSubmit} 
            initialData={editingTour || undefined}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Tours List"
          data={toursList}
          onDelete={handleDelete}
          onEdit={handleEdit}
          getItemTitle={(tour: Tour) => tour.title}
          getItemSubtitle={(tour: Tour) => `${tour.duration} - ${tour.startingAddress}`}
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
          fetchFullDetails={async (id: string) => {
            const response = await tours.getById(id);
            return response.data;
          }}
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