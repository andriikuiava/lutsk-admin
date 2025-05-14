import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Grid,
  Typography,
  MenuItem,
  InputLabel,
  FormControl,
  Select,
  FormHelperText,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PromoCode, Tour } from '../../types/api';

interface PromoCodeFormProps {
  onSubmit: (data: Partial<PromoCode>) => Promise<void>;
  initialData?: Partial<PromoCode>;
  tours: Tour[];
}

export default function PromoCodeForm({ onSubmit, initialData, tours }: PromoCodeFormProps) {
  const [formData, setFormData] = useState<Partial<PromoCode>>({
    code: '',
    maxActivations: 10,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days from now
    active: true,
    tourId: '',
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PromoCode, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      });
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PromoCode, string>> = {};

    if (!formData.code?.trim()) {
      newErrors.code = 'Promo code is required';
    }

    if (!formData.maxActivations || formData.maxActivations <= 0) {
      newErrors.maxActivations = 'Max activations must be a positive number';
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    if (!formData.tourId) {
      newErrors.tourId = 'Tour is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: Number(value) });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData({ ...formData, expiryDate: date.toISOString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      // Form was submitted successfully
    } catch (err) {
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {initialData?.id ? 'Edit' : 'Create'} Promo Code
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid md={6} lg={6} xs={12}>
              <TextField
                label="Promo Code"
                name="code"
                value={formData.code || ''}
                onChange={handleInputChange}
                fullWidth
                required
                error={!!errors.code}
                helperText={errors.code}
                InputProps={{
                  sx: { textTransform: 'uppercase' }
                }}
              />
            </Grid>
            <Grid md={6} lg={6} xs={12}>
              <TextField
                label="Max Activations"
                name="maxActivations"
                type="number"
                value={formData.maxActivations || ''}
                onChange={handleNumberInputChange}
                fullWidth
                required
                error={!!errors.maxActivations}
                helperText={errors.maxActivations}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid md={6} lg={6} xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Expiry Date"
                  value={formData.expiryDate ? new Date(formData.expiryDate) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.expiryDate,
                      helperText: errors.expiryDate
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid md={6} lg={6} xs={12}>
              <FormControl fullWidth error={!!errors.tourId}>
                <InputLabel id="tour-select-label">Tour</InputLabel>
                <Select
                  labelId="tour-select-label"
                  name="tourId"
                  value={formData.tourId || ''}
                  onChange={handleSelectChange}
                  required
                >
                  {tours.map((tour) => (
                    <MenuItem key={tour.id} value={tour.id}>
                      {tour.title}
                    </MenuItem>
                  ))}
                </Select>
                {errors.tourId && <FormHelperText>{errors.tourId}</FormHelperText>}
              </FormControl>
            </Grid>
            {initialData?.id && (
              <Grid xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={handleSwitchChange}
                      name="active"
                      color="primary"
                    />
                  }
                  label="Active"
                />
              </Grid>
            )}
            <Grid xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
} 