import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import type { Event } from '../../types/api';

interface EventFormProps {
  onSubmit: (data: Partial<Event>) => Promise<void>;
  initialData?: Partial<Event>;
}

export default function EventForm({ onSubmit, initialData }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '');
  const [eventTime, setEventTime] = useState(initialData?.eventTime || new Date().toISOString().slice(0, 16));
  const [link, setLink] = useState(initialData?.link || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      images,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      eventTime,
      link,
      price,
      address,
      phone,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        fullWidth
        multiline
        rows={4}
      />
      <TextField
        label="Images (comma-separated URLs)"
        value={images.join(', ')}
        onChange={(e) => setImages(e.target.value.split(',').map(url => url.trim()))}
        fullWidth
        helperText="Enter image URLs separated by commas"
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
              label="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              fullWidth
              type="number"
              inputProps={{ step: 'any' }}
          />
          <TextField
              label="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              fullWidth
              type="number"
              inputProps={{ step: 'any' }}
          />

      </Box>
      <TextField
        label="Event Time"
        value={eventTime}
        onChange={(e) => setEventTime(e.target.value)}
        required
        fullWidth
        type="datetime-local"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        fullWidth
      />
      <TextField
        label="Price (string)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        fullWidth
      />
      <TextField
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
      />
      <Button type="submit" variant="contained" size="large">
        {initialData ? 'Update Event' : 'Create Event'}
      </Button>
    </Box>
  );
}