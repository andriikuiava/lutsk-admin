import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import type { Place } from '../../types/api';

interface PlaceFormProps {
  onSubmit: (data: Partial<Place>) => Promise<void>;
  initialData?: Partial<Place>;
}

export default function PlaceForm({ onSubmit, initialData }: PlaceFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(initialData?.type || 'HISTORICAL');
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [latitude, setLatitude] = useState(initialData?.latitude || 0);
  const [longitude, setLongitude] = useState(initialData?.longitude || 0);
  const [link, setLink] = useState(initialData?.link || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [googleMapsLink, setGoogleMapsLink] = useState(initialData?.googleMapsLink || '');
  const [address, setAddress] = useState(initialData?.address || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      type,
      description,
      images,
      latitude,
      longitude,
      link,
      price,
      phone,
      googleMapsLink,
      address,
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
      <FormControl fullWidth required>
        <InputLabel>Type</InputLabel>
        <Select
          value={type}
          label="Type"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value="HISTORICAL">Historical</MenuItem>
          <MenuItem value="CULTURAL">Cultural</MenuItem>
          <MenuItem value="NATURAL">Natural</MenuItem>
          <MenuItem value="ENTERTAINMENT">Entertainment</MenuItem>
          <MenuItem value="SHOPPING">Shopping</MenuItem>
          <MenuItem value="FOOD">Food</MenuItem>
        </Select>
      </FormControl>
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
          onChange={(e) => setLatitude(Number(e.target.value))}
          required
          fullWidth
          type="number"
          inputProps={{ step: 'any' }}
        />
        <TextField
          label="Longitude"
          value={longitude}
          onChange={(e) => setLongitude(Number(e.target.value))}
          required
          fullWidth
          type="number"
          inputProps={{ step: 'any' }}
        />
      </Box>
      <TextField
        label="Link"
        value={link}
        onChange={(e) => setLink(e.target.value)}
        fullWidth
      />
      <TextField
        label="Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        fullWidth
        type="number"
      />
      <TextField
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
      />
      <TextField
        label="Google Maps Link"
        value={googleMapsLink}
        onChange={(e) => setGoogleMapsLink(e.target.value)}
        fullWidth
      />
      <TextField
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        required
        fullWidth
      />
      <Button type="submit" variant="contained" size="large">
        {initialData ? 'Update Place' : 'Create Place'}
      </Button>
    </Box>
  );
} 