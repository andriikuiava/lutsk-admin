import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface JsonEditorProps {
  data: any;
  onChange?: (newData: any) => void;
  readOnly?: boolean;
  title?: string;
}

export default function JsonEditor({
  data,
  onChange,
  readOnly = false,
  title,
}: JsonEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonString, setJsonString] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setJsonString(JSON.stringify(data, null, 2));
  };

  const handleSave = () => {
    try {
      const parsedData = JSON.parse(jsonString);
      onChange?.(parsedData);
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Invalid JSON format');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setJsonString(JSON.stringify(data, null, 2));
    setError('');
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        {title && (
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        )}
        {!readOnly && !isEditing && (
          <IconButton onClick={handleEdit} size="small">
            <EditIcon />
          </IconButton>
        )}
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {isEditing ? (
        <>
          <TextField
            fullWidth
            multiline
            rows={10}
            value={jsonString}
            onChange={(e) => setJsonString(e.target.value)}
            error={!!error}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </>
      ) : (
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '400px',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </Box>
      )}
    </Paper>
  );
} 