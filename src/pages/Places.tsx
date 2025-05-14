import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataDisplay from '../components/DataDisplay';
import PlaceForm from '../components/forms/PlaceForm';
import { places } from '../api/client';
import type { Place } from '../types/api';

export default function Places() {
  const [showCreate, setShowCreate] = useState(false);
  const [placesList, setPlacesList] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlaces();
  }, []);

  const loadPlaces = async () => {
    try {
      const response = await places.getAll();
      setPlacesList(response.data);
    } catch (error) {
      console.error('Error loading places:', error);
      setError('Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await places.delete(id);
      setPlacesList(prev => prev.filter(place => place.id !== id));
      setSuccess('Place deleted successfully');
    } catch (error) {
      console.error('Error deleting place:', error);
      setError('Failed to delete place');
      throw error;
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await places.getById(id);
      setEditingPlace(response.data);
      setShowCreate(true);
    } catch (error) {
      console.error('Error loading place details:', error);
      setError('Failed to load place details');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingPlace) {
        await places.update(editingPlace.id, formData);
        setSuccess('Place updated successfully');
      } else {
        await places.create(formData);
        setSuccess('Place created successfully');
      }
      await loadPlaces();
      setShowCreate(false);
      setEditingPlace(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save place');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditingPlace(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Places
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingPlace(null);
            setShowCreate(!showCreate);
          }}
        >
          {showCreate ? 'Cancel' : 'Create Place'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <PlaceForm 
            onSubmit={handleSubmit} 
            initialData={editingPlace || undefined}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Places List"
          data={placesList}
          onDelete={handleDelete}
          onEdit={handleEdit}
          getItemTitle={(place: Place) => place.title}
          getItemSubtitle={(place: Place) => `${place.type} - ${place.address}`}
          getItemDetails={(place: Place) => ({
            ID: place.id,
            Type: place.type,
            Description: place.description,
            Address: place.address,
            Images: place.images,
            Latitude: place.latitude,
            Longitude: place.longitude,
            Link: place.link,
            Price: place.price,
            Phone: place.phone,
            'Google Maps Link': place.googleMapsLink,
          })}
          fetchFullDetails={async (id: string) => {
            const response = await places.getById(id);
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