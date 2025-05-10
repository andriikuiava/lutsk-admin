import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CloudUpload as UploadIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { uploads } from '../api/client';

interface UploadGroup {
  title: string;
  description: string;
  endpoint: string;
  accept: string;
  multiple?: boolean;
  uploadType: 'image' | 'eventImages' | 'articleImages' | 'placeImages' | 'tourImages' | 'tourAudio';
}

interface UploadResponse {
  url?: string;
  urls?: string[];
  keys?: string[];
}

const publicUploads: UploadGroup[] = [
  {
    title: 'Single Images',
    description: 'Upload individual images that can be used anywhere in the app.',
    endpoint: '/api/uploads/images',
    accept: 'image/*',
    uploadType: 'image'
  },
  {
    title: 'Event Images',
    description: 'Upload multiple images for events. These will be displayed in event galleries.',
    endpoint: '/api/uploads/event-images',
    accept: 'image/*',
    multiple: true,
    uploadType: 'eventImages'
  },
  {
    title: 'Article Images',
    description: 'Upload multiple images for articles. These will be displayed in article galleries.',
    endpoint: '/api/uploads/article-images',
    accept: 'image/*',
    multiple: true,
    uploadType: 'articleImages'
  },
  {
    title: 'Place Images',
    description: 'Upload multiple images for places. These will be displayed in place galleries.',
    endpoint: '/api/uploads/place-images',
    accept: 'image/*',
    multiple: true,
    uploadType: 'placeImages'
  },
];

const encryptedUploads: UploadGroup[] = [
  {
    title: 'Tour Images',
    description: 'Upload multiple images for tours. These are encrypted and only visible to tour purchasers.',
    endpoint: '/api/uploads/tour-images',
    accept: 'image/*',
    multiple: true,
    uploadType: 'tourImages'
  },
  {
    title: 'Tour Audio',
    description: 'Upload audio files for tours. These are encrypted and only accessible to tour purchasers.',
    endpoint: '/api/uploads/tour-audio',
    accept: 'audio/*',
    multiple: true,
    uploadType: 'tourAudio'
  },
];

export default function Uploads() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, groupTitle: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(prev => ({ ...prev, [groupTitle]: true }));
      setTimeout(() => {
        setCopied(prev => ({ ...prev, [groupTitle]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleUpload = async (group: UploadGroup) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = group.accept;
    input.multiple = group.multiple || false;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;

      setLoading(prev => ({ ...prev, [group.title]: true }));
      setError(prev => ({ ...prev, [group.title]: '' }));
      setSuccess(prev => ({ ...prev, [group.title]: '' }));

      try {
        let response;
        if (group.multiple) {
          const filesArray = Array.from(files);
          response = await uploads[group.uploadType](filesArray as any);
        } else {
          response = await uploads.image(files[0]);
        }
        
        // Check if response contains url, urls or keys
        const uploadedData = response.data as UploadResponse;
        let successMessage = `Successfully uploaded ${files.length} file(s)\n`;
        let dataToCopy = '';
        
        if (uploadedData.url) {
          successMessage += '\nUploaded URL:\n1. ' + uploadedData.url;
          dataToCopy = uploadedData.url;
        } else if (uploadedData.urls && uploadedData.urls.length > 0) {
          successMessage += '\nUploaded URLs:\n' + uploadedData.urls.map((url, index) => 
            `${index + 1}. ${url}`
          ).join('\n');
          dataToCopy = uploadedData.urls.join('\n');
        } else if (uploadedData.keys && uploadedData.keys.length > 0) {
          successMessage += '\nUploaded Keys:\n' + uploadedData.keys.map((key, index) => 
            `${index + 1}. ${key}`
          ).join('\n');
          dataToCopy = uploadedData.keys.join('\n');
        }
        
        setSuccess(prev => ({ 
          ...prev, 
          [group.title]: successMessage,
          [`${group.title}_copy`]: dataToCopy
        }));
      } catch (err) {
        setError(prev => ({ 
          ...prev, 
          [group.title]: 'Failed to upload files. Please try again.'
        }));
      } finally {
        setLoading(prev => ({ ...prev, [group.title]: false }));
      }
    };

    input.click();
  };

  const renderSuccessAlert = (group: UploadGroup) => {
    const successMessage = success[group.title];
    const dataToCopy = success[`${group.title}_copy`];

    return (
      <Alert 
        severity="success" 
        onClose={() => {
          setSuccess(prev => ({ 
            ...prev, 
            [group.title]: '',
            [`${group.title}_copy`]: ''
          }));
        }}
        sx={{ position: 'relative' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{successMessage}</pre>
          {dataToCopy && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Raw data:
              </Typography>
              <Box 
                sx={{ 
                  p: 1, 
                  bgcolor: 'background.paper', 
                  borderRadius: 1,
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                  {dataToCopy}
                </pre>
                <Tooltip title={copied[group.title] ? "Copied!" : "Copy to clipboard"}>
                  <IconButton 
                    size="small" 
                    onClick={() => copyToClipboard(dataToCopy, group.title)}
                    sx={{ ml: 1 }}
                  >
                    <CopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          )}
        </Box>
      </Alert>
    );
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Media Uploads
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Public Uploads Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Public Media
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These files are publicly accessible to all users.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {publicUploads.map((group) => (
              <Card key={group.title} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {group.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => handleUpload(group)}
                      disabled={loading[group.title]}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {loading[group.title] ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Upload ${group.title}`
                      )}
                    </Button>

                    {error[group.title] && (
                      <Alert severity="error" onClose={() => setError(prev => ({ ...prev, [group.title]: '' }))}>
                        {error[group.title]}
                      </Alert>
                    )}

                    {success[group.title] && renderSuccessAlert(group)}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        <Divider />

        {/* Encrypted Uploads Section */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'text.primary' }}>
            Encrypted Media
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These files are encrypted and only accessible to users who have purchased the tour.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {encryptedUploads.map((group) => (
              <Card key={group.title} variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                        {group.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => handleUpload(group)}
                      disabled={loading[group.title]}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      {loading[group.title] ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        `Upload ${group.title}`
                      )}
                    </Button>

                    {error[group.title] && (
                      <Alert severity="error" onClose={() => setError(prev => ({ ...prev, [group.title]: '' }))}>
                        {error[group.title]}
                      </Alert>
                    )}

                    {success[group.title] && renderSuccessAlert(group)}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
} 