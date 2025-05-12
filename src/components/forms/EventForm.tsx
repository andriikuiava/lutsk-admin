import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { Event } from '../../types/api';

interface EventFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<Event>;
}

export default function EventForm({ onSubmit, initialData }: EventFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [latitude, setLatitude] = useState(initialData?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(initialData?.longitude?.toString() || '');
  const [eventTime, setEventTime] = useState(initialData?.eventTime || new Date().toISOString().slice(0, 16));
  const [link, setLink] = useState(initialData?.link || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append all text fields
    formData.append('title', title);
    formData.append('description', description);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('eventTime', eventTime);
    formData.append('link', link);
    formData.append('price', price);
    formData.append('address', address);
    formData.append('phone', phone);

    // Append all image files
    imageFiles.forEach((file) => {
      formData.append('imageFiles', file);
    });

    await onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
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
        label="Price"
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
      
      {/* File upload section */}
      <Box>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button variant="outlined" component="span">
            Upload Images
          </Button>
        </label>
        
        {/* Display selected files */}
        <Box sx={{ mt: 2 }}>
          {imageFiles.map((file, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2">{file.name}</Typography>
              <IconButton size="small" onClick={() => removeFile(index)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>

      <Button type="submit" variant="contained" size="large">
        {initialData ? 'Update Event' : 'Create Event'}
      </Button>
    </Box>
  );
}