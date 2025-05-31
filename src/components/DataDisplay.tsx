import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
  Image as ImageIcon,
  TextFields as TextFieldsIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

interface ExtraAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (id: string) => void;
}

interface DataDisplayProps<T> {
  title: string;
  data: T[];
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string) => Promise<void>;
  getItemTitle: (item: T) => string;
  getItemSubtitle?: (item: T) => string | React.ReactNode;
  getItemDetails?: (item: T) => Record<string, any>;
  fetchFullDetails: (id: string) => Promise<T>;
  extraActions?: ExtraAction<T>[];
}

const renderArticleContent = (content: any) => (
  <Box key={content.position} sx={{ mb: 3 }}>
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {content.contentType === 'TEXT' && <TextFieldsIcon sx={{ mr: 1 }} />}
        {content.contentType === 'IMAGE' && <ImageIcon sx={{ mr: 1 }} />}
        {content.contentType === 'AUDIO' && <PlayArrowIcon sx={{ mr: 1 }} />}
        {content.title && (
          <Typography variant="subtitle2">
            {content.title}
          </Typography>
        )}
      </Box>
      
      {content.text && (
        <Typography variant="body1" paragraph>
          {content.text}
        </Typography>
      )}
      
      {content.imageUrl && (
        <Box sx={{ mt: 1 }}>
          <img
            src={content.imageUrl}
            alt={content.title || 'Article image'}
            style={{ maxWidth: '100%', borderRadius: 4 }}
          />
        </Box>
      )}
      
      {content.audioUrl && (
        <Box sx={{ mt: 1 }}>
          <audio controls style={{ width: '100%' }}>
            <source src={content.audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </Box>
      )}
    </Paper>
  </Box>
);

const renderTourStop = (stop: any) => (
  <Card key={stop.id} sx={{ mb: 3 }}>
    <CardMedia
      component="img"
      height="200"
      image={stop.coverImage}
      alt={stop.title}
      sx={{ objectFit: 'cover' }}
    />
    <CardContent>
      <Typography variant="h6" gutterBottom>
        {stop.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {stop.description}
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Chip 
          label={`Position: ${stop.position}`} 
          size="small" 
          sx={{ mr: 1 }} 
        />
        <Chip 
          label={stop.address} 
          size="small" 
          sx={{ mr: 1 }} 
        />
        <Chip 
          label={`${stop.latitude}, ${stop.longitude}`} 
          size="small" 
        />
      </Box>

      <Typography variant="subtitle1" gutterBottom>
        Contents:
      </Typography>
      <Box>
        {stop.contents?.map((content: any) => (
          <Box key={content.position} sx={{ mb: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {content.contentType === 'text' && <TextFieldsIcon sx={{ mr: 1 }} />}
                {content.contentType === 'image' && <ImageIcon sx={{ mr: 1 }} />}
                {content.contentType === 'audio' && <PlayArrowIcon sx={{ mr: 1 }} />}
                <Typography variant="subtitle2">
                  {content.title}
                </Typography>
              </Box>
              
              {content.text && (
                <Typography variant="body2" paragraph>
                  {content.text}
                </Typography>
              )}
              
              {content.imageUrl && (
                <Box sx={{ mt: 1 }}>
                  <img
                    src={content.imageUrl}
                    alt={content.title}
                    style={{ maxWidth: '100%', borderRadius: 4 }}
                  />
                </Box>
              )}
              
              {content.audioUrl && (
                <Box sx={{ mt: 1 }}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={content.audioUrl} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                </Box>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    </CardContent>
  </Card>
);

export default function DataDisplay<T extends { id: string }>({
  title,
  data,
  onDelete,
  onEdit,
  getItemTitle,
  getItemSubtitle,
  getItemDetails,
  fetchFullDetails,
  extraActions,
}: DataDisplayProps<T>) {
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Ensure data is an array and handle undefined/null cases
  const safeData = Array.isArray(data) ? data : [];

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show empty state
  if (!safeData || safeData.length === 0) {
    return (
      <Paper
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          No Data Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          There are no items to display at the moment.
        </Typography>
      </Paper>
    );
  }

  const handleItemClick = async (item: T) => {
    setDetailsLoading(true);
    try {
      const fullDetails = await fetchFullDetails(item.id);
      setSelectedItem(fullDetails);
    } catch (error) {
      console.error('Error fetching details:', error);
      setToast({
        open: true,
        message: 'Error fetching item details',
        severity: 'error',
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !onDelete) return;

    setLoading(true);
    try {
      await onDelete(itemToDelete);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setToast({
        open: true,
        message: 'Item deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      setToast({
        open: true,
        message: 'Error deleting item',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const renderValue = (key: string, value: any) => {
    // If the value is already a React node, return it directly
    if (React.isValidElement(value)) {
      return value;
    }

    if (key === 'Stops' && Array.isArray(value)) {
      return (
        <Box sx={{ mt: 2 }}>
          {value.map((stop) => renderTourStop(stop))}
        </Box>
      );
    }

    if (key === 'Contents' && Array.isArray(value)) {
      return (
        <Box sx={{ mt: 2 }}>
          {value.map((content) => renderArticleContent(content))}
        </Box>
      );
    }

    if (key.toLowerCase().includes('image') && typeof value === 'string') {
      return (
        <Box sx={{ width: '100%', maxWidth: 300, mt: 1 }}>
          <img
            src={value}
            alt={key}
            style={{ width: '100%', height: 'auto', borderRadius: 4 }}
          />
        </Box>
      );
    }

    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string' && value[0].startsWith('http')) {
      return (
        <ImageList sx={{ width: '100%', maxWidth: 500 }} cols={3} rowHeight={164}>
          {value.map((img, index) => (
            <ImageListItem key={index}>
              <img
                src={img}
                alt={`${key} ${index + 1}`}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Box sx={{ mt: 1, pl: 2 }}>
          {Object.entries(value).map(([subKey, subValue]) => (
            <Box key={subKey} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {subKey}
              </Typography>
              <Typography>
                {typeof subValue === 'object' ? JSON.stringify(subValue, null, 2) : String(subValue)}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }

    return String(value);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <List>
        {data.map((item) => (
          <ListItem
            key={item.id}
            sx={{
              mb: 2,
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <ListItemText
              primary={getItemTitle(item)}
              secondary={getItemSubtitle?.(item)}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {extraActions?.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  startIcon={action.icon}
                  onClick={() => action.onClick(item.id)}
                >
                  {action.label}
                </Button>
              ))}
              {onEdit && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onEdit(item.id)}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleItemClick(item)}
              >
                View Details
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeleteClick(item.id)}
              >
                Delete
              </Button>
            </Box>
          </ListItem>
        ))}
      </List>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedItem}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedItem && (
          <>
            <DialogTitle>{getItemTitle(selectedItem)}</DialogTitle>
            <DialogContent>
              {detailsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                getItemDetails && (
                  <Box sx={{ mt: 2 }}>
                    {Object.entries(getItemDetails(selectedItem)).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {key}
                        </Typography>
                        {renderValue(key, value)}
                      </Box>
                    ))}
                  </Box>
                )
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 