import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  Stack,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import { adminUsers, tours } from '../api/client';
import type { UserInfo, Tour } from '../types/api';

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [selectedTour, setSelectedTour] = useState<string>('');
  const [deletingUser, setDeletingUser] = useState<UserInfo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grantAccessDialogOpen, setGrantAccessDialogOpen] = useState(false);
  const [revokeAccessDialogOpen, setRevokeAccessDialogOpen] = useState(false);
  const [revokeAccessData, setRevokeAccessData] = useState<{ userId: number; tourId: string; tourTitle: string } | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch users
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await adminUsers.getAll();
      return response.data;
    },
  });

  // Fetch tours for the grant access dropdown
  const { 
    data: toursList, 
    isLoading: toursLoading 
  } = useQuery({
    queryKey: ['tours'],
    queryFn: async () => {
      const response = await tours.getAll();
      return response.data;
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => adminUsers.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteDialogOpen(false);
      setDeletingUser(null);
    },
  });

  // Grant tour access mutation
  const grantAccessMutation = useMutation({
    mutationFn: ({ userId, tourId }: { userId: number; tourId: string }) => 
      adminUsers.grantTourAccess(userId, tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setGrantAccessDialogOpen(false);
      setSelectedUser(null);
      setSelectedTour('');
    },
  });

  // Revoke tour access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: ({ userId, tourId }: { userId: number; tourId: string }) => 
      adminUsers.revokeTourAccess(userId, tourId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setRevokeAccessDialogOpen(false);
      setRevokeAccessData(null);
    },
  });

  // Handle opening the delete dialog
  const handleDeleteClick = (user: UserInfo) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deletingUser) {
      deleteUserMutation.mutate(deletingUser.id);
    }
  };

  // Handle opening the grant access dialog
  const handleGrantAccessClick = (user: UserInfo) => {
    setSelectedUser(user);
    setGrantAccessDialogOpen(true);
  };

  // Handle grant access confirmation
  const handleGrantAccessConfirm = () => {
    if (selectedUser && selectedTour) {
      grantAccessMutation.mutate({ 
        userId: selectedUser.id, 
        tourId: selectedTour 
      });
    }
  };

  // Handle opening the revoke access dialog
  const handleRevokeAccessClick = (userId: number, tourId: string, tourTitle: string) => {
    setRevokeAccessData({ userId, tourId, tourTitle });
    setRevokeAccessDialogOpen(true);
  };

  // Handle revoke access confirmation
  const handleRevokeAccessConfirm = () => {
    if (revokeAccessData) {
      revokeAccessMutation.mutate({ 
        userId: revokeAccessData.userId, 
        tourId: revokeAccessData.tourId 
      });
    }
  };

  if (usersLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (usersError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading users. Please try again.
      </Alert>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      
      <Paper sx={{ mt: 3, p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Paid Tours</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {user.paidTours.length > 0 ? (
                        user.paidTours.map((tour) => (
                          <Chip
                            key={tour.id}
                            label={tour.title}
                            onDelete={() => handleRevokeAccessClick(user.id, tour.id, tour.title)}
                            deleteIcon={<RemoveIcon />}
                            sx={{ my: 0.5 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No paid tours
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Grant Tour Access">
                        <IconButton 
                          color="primary"
                          onClick={() => handleGrantAccessClick(user)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete User">
                        <IconButton 
                          color="error"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Delete User Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user <strong>{deletingUser?.email}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleteUserMutation.isPending}
          >
            {deleteUserMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Grant Tour Access Dialog */}
      <Dialog
        open={grantAccessDialogOpen}
        onClose={() => setGrantAccessDialogOpen(false)}
      >
        <DialogTitle>Grant Tour Access</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a tour to grant access to user <strong>{selectedUser?.email}</strong>:
          </DialogContentText>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="tour-select-label">Tour</InputLabel>
            <Select
              labelId="tour-select-label"
              value={selectedTour}
              label="Tour"
              onChange={(e) => setSelectedTour(e.target.value)}
            >
              {toursLoading ? (
                <MenuItem disabled>Loading tours...</MenuItem>
              ) : (
                toursList?.map((tour: Tour) => (
                  <MenuItem key={tour.id} value={tour.id}>
                    {tour.title}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGrantAccessDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleGrantAccessConfirm} 
            color="primary" 
            variant="contained"
            disabled={!selectedTour || grantAccessMutation.isPending}
          >
            {grantAccessMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Grant Access'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Tour Access Dialog */}
      <Dialog
        open={revokeAccessDialogOpen}
        onClose={() => setRevokeAccessDialogOpen(false)}
      >
        <DialogTitle>Revoke Tour Access</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to revoke access to tour <strong>{revokeAccessData?.tourTitle}</strong>? 
            The user will no longer be able to access this tour.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRevokeAccessDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRevokeAccessConfirm} 
            color="error" 
            variant="contained"
            disabled={revokeAccessMutation.isPending}
          >
            {revokeAccessMutation.isPending ? (
              <CircularProgress size={24} />
            ) : (
              'Revoke Access'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 