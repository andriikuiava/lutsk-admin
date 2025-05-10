import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import JsonEditor from './JsonEditor';

interface ApiRequestProps {
  title: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  onRequest: (data?: any) => Promise<any>;
  initialData?: any;
  readOnly?: boolean;
}

export default function ApiRequest({
  title,
  method,
  endpoint,
  onRequest,
  initialData = {},
  readOnly = false,
}: ApiRequestProps) {
  const [requestData, setRequestData] = useState(initialData);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await onRequest(requestData);
      setResponse(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" component="h2" gutterBottom>
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {method} {endpoint}
      </Typography>

      {!readOnly && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Request Data
          </Typography>
          <JsonEditor
            data={requestData}
            onChange={setRequestData}
            readOnly={readOnly}
          />
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
          onClick={handleRequest}
          disabled={loading}
        >
          Send Request
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {response && (
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Response
          </Typography>
          <JsonEditor data={response} readOnly />
        </Box>
      )}
    </Paper>
  );
} 