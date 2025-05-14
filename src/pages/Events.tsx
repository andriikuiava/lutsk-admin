import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataDisplay from '../components/DataDisplay';
import EventForm from '../components/forms/EventForm';
import { events } from '../api/client';
import type { Event } from '../types/api';

export default function Events() {
  const [showCreate, setShowCreate] = useState(false);
  const [eventsList, setEventsList] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await events.getAll();
      setEventsList(response.data);
    } catch (error) {
      console.error('Error loading events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await events.delete(id);
      setEventsList(prev => prev.filter(event => event.id !== id));
      setSuccess('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Failed to delete event');
      throw error;
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await events.getById(id);
      setEditingEvent(response.data);
      setShowCreate(true);
    } catch (error) {
      console.error('Error loading event details:', error);
      setError('Failed to load event details');
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      if (editingEvent) {
        await events.update(editingEvent.id, formData);
        setSuccess('Event updated successfully');
      } else {
        await events.create(formData);
        setSuccess('Event created successfully');
      }
      await loadEvents();
      setShowCreate(false);
      setEditingEvent(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditingEvent(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingEvent(null);
            setShowCreate(!showCreate);
          }}
        >
          {showCreate ? 'Cancel' : 'Create Event'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <EventForm 
            onSubmit={handleSubmit} 
            initialData={editingEvent || undefined}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Events List"
          data={eventsList}
          onDelete={handleDelete}
          onEdit={handleEdit}
          getItemTitle={(event: Event) => event.title}
          getItemSubtitle={(event: Event) => event.description || 'No description available'}
          getItemDetails={(event: Event) => ({
            ID: event.id,
            Description: event.description,
            Images: event.images,
            'Time Published': new Date(event.timePublished).toLocaleString(),
            'Event Time': new Date(event.eventTime).toLocaleString(),
            Latitude: event.latitude,
            Longitude: event.longitude,
            Link: event.link,
            Price: event.price,
            Address: event.address,
            Phone: event.phone,
          })}
          fetchFullDetails={async (id: string) => {
            const response = await events.getById(id);
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