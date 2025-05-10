import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { Tour, TourStop, ArticleContent } from '../../types/api';

interface TourFormProps {
  onSubmit: (data: Partial<Tour>) => Promise<void>;
  initialData?: Partial<Tour>;
}

export default function TourForm({ onSubmit, initialData }: TourFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [duration, setDuration] = useState(initialData?.duration || '');
  const [latitude, setLatitude] = useState(initialData?.latitude || 0);
  const [longitude, setLongitude] = useState(initialData?.longitude || 0);
  const [startingAddress, setStartingAddress] = useState(initialData?.startingAddress || '');
  const [stops, setStops] = useState<TourStop[]>(initialData?.stops || [
    {
      title: '',
      description: '',
      coverImage: '',
      latitude: 0,
      longitude: 0,
      address: '',
      position: 1,
      contents: [
        {
          contentType: 'TEXT',
          title: '',
          text: '',
          imageUrl: null,
          audioUrl: null,
          position: 1,
        },
      ],
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      description,
      coverImage,
      duration,
      latitude,
      longitude,
      startingAddress,
      stops,
    });
  };

  const addStop = () => {
    setStops([
      ...stops,
      {
        title: '',
        description: '',
        coverImage: '',
        latitude: 0,
        longitude: 0,
        address: '',
        position: stops.length + 1,
        contents: [
          {
            contentType: 'TEXT',
            title: '',
            text: '',
            imageUrl: null,
            audioUrl: null,
            position: 1,
          },
        ],
      },
    ]);
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index).map((stop, i) => ({
      ...stop,
      position: i + 1,
    })));
  };

  const updateStop = (index: number, field: string, value: any) => {
    const newStops = [...stops];
    newStops[index] = {
      ...newStops[index],
      [field]: value,
    };
    setStops(newStops);
  };

  const addContent = (stopIndex: number) => {
    const newStops = [...stops];
    newStops[stopIndex].contents = [
      ...newStops[stopIndex].contents,
      {
        contentType: 'TEXT',
        title: '',
        text: '',
        imageUrl: null,
        audioUrl: null,
        position: newStops[stopIndex].contents.length + 1,
      },
    ];
    setStops(newStops);
  };

  const removeContent = (stopIndex: number, contentIndex: number) => {
    const newStops = [...stops];
    newStops[stopIndex].contents = newStops[stopIndex].contents
      .filter((_, i) => i !== contentIndex)
      .map((content, i) => ({
        ...content,
        position: i + 1,
      }));
    setStops(newStops);
  };

  const updateContent = (stopIndex: number, contentIndex: number, field: string, value: any) => {
    const newStops = [...stops];
    newStops[stopIndex].contents[contentIndex] = {
      ...newStops[stopIndex].contents[contentIndex],
      [field]: value,
    };
    setStops(newStops);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Tour Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            required
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Starting Address"
              value={startingAddress}
              onChange={(e) => setStartingAddress(e.target.value)}
              required
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              type="number"
              label="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(Number(e.target.value))}
              required
            />
            <TextField
              fullWidth
              type="number"
              label="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(Number(e.target.value))}
              required
            />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tour Stops</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addStop}
            variant="outlined"
          >
            Add Stop
          </Button>
        </Box>

        {stops.map((stop, stopIndex) => (
          <Paper key={stopIndex} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Stop {stopIndex + 1}</Typography>
              <IconButton
                onClick={() => removeStop(stopIndex)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={stop.title}
                onChange={(e) => updateStop(stopIndex, 'title', e.target.value)}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={stop.description}
                onChange={(e) => updateStop(stopIndex, 'description', e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Cover Image URL"
                value={stop.coverImage}
                onChange={(e) => updateStop(stopIndex, 'coverImage', e.target.value)}
                required
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Address"
                  value={stop.address}
                  onChange={(e) => updateStop(stopIndex, 'address', e.target.value)}
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Latitude"
                  value={stop.latitude}
                  onChange={(e) => updateStop(stopIndex, 'latitude', Number(e.target.value))}
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Longitude"
                  value={stop.longitude}
                  onChange={(e) => updateStop(stopIndex, 'longitude', Number(e.target.value))}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">Contents</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addContent(stopIndex)}
                  variant="outlined"
                  size="small"
                >
                  Add Content
                </Button>
              </Box>

              {stop.contents.map((content, contentIndex) => (
                <Paper key={contentIndex} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2">Content {contentIndex + 1}</Typography>
                    <IconButton
                      onClick={() => removeContent(stopIndex, contentIndex)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Content Type</InputLabel>
                      <Select
                        value={content.contentType}
                        label="Content Type"
                        onChange={(e) => updateContent(stopIndex, contentIndex, 'contentType', e.target.value)}
                        required
                      >
                        <MenuItem value="TEXT">Text</MenuItem>
                        <MenuItem value="IMAGE">Image</MenuItem>
                        <MenuItem value="AUDIO">Audio</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Title"
                      value={content.title}
                      onChange={(e) => updateContent(stopIndex, contentIndex, 'title', e.target.value)}
                      required
                    />
                    {content.contentType === 'TEXT' && (
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Text"
                        value={content.text || ''}
                        onChange={(e) => updateContent(stopIndex, contentIndex, 'text', e.target.value)}
                      />
                    )}
                    {content.contentType === 'IMAGE' && (
                      <TextField
                        fullWidth
                        label="Image URL"
                        value={content.imageUrl || ''}
                        onChange={(e) => updateContent(stopIndex, contentIndex, 'imageUrl', e.target.value)}
                      />
                    )}
                    {content.contentType === 'AUDIO' && (
                      <TextField
                        fullWidth
                        label="Audio URL"
                        value={content.audioUrl || ''}
                        onChange={(e) => updateContent(stopIndex, contentIndex, 'audioUrl', e.target.value)}
                      />
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>

      <Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          {initialData ? 'Update Tour' : 'Create Tour'}
        </Button>
      </Box>
    </Box>
  );
} 