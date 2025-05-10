import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

export default function Settings() {
  const [token, setToken] = useState(localStorage.getItem('accessToken') || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    try {
      // Basic JWT validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }

      // Try to decode the payload
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.exp) {
        throw new Error('Invalid JWT token: missing expiration');
      }

      // Check if token is expired
      if (payload.exp * 1000 < Date.now()) {
        throw new Error('JWT token has expired');
      }

      localStorage.setItem('accessToken', token);
      setSuccess(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Invalid token');
      setSuccess(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Typography variant="h6" gutterBottom>
          JWT Token
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Set your JWT token to authenticate API requests. The token should be in the format:
          eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Token saved successfully
          </Alert>
        )}

        <TextField
          fullWidth
          multiline
          rows={4}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your JWT token"
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save Token
        </Button>
      </Paper>
    </Box>
  );
} 