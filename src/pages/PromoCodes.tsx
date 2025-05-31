import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField
} from '@mui/material';
import { Add as AddIcon, Send as SendIcon } from '@mui/icons-material';
import DataDisplay from '../components/DataDisplay';
import PromoCodeForm from '../components/forms/PromoCodeForm';
import { promos, tours } from '../api/client';
import type { PromoCode, Tour } from '../types/api';

export default function PromoCodes() {
  const [showCreate, setShowCreate] = useState(false);
  const [promoList, setPromoList] = useState<PromoCode[]>([]);
  const [toursList, setToursList] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedPromoId, setSelectedPromoId] = useState<string | null>(null);
  const [emails, setEmails] = useState<string>('');
  const [sendingEmails, setSendingEmails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [promosResponse, toursResponse] = await Promise.all([
        promos.getAll(),
        tours.getAll()
      ]);
      setPromoList(promosResponse.data);
      setToursList(toursResponse.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Assuming there's no delete endpoint for promocodes
      // Update the promo to inactive instead
      await promos.update(id, { active: false });
      await loadData();
      setSuccess('Promo code deactivated successfully');
    } catch (error) {
      console.error('Error deactivating promo code:', error);
      setError('Failed to deactivate promo code');
      throw error;
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const foundPromo = promoList.find(promo => promo.id === id);
      if (foundPromo) {
        setEditingPromo(foundPromo);
        setShowCreate(true);
      }
    } catch (error) {
      console.error('Error loading promo details:', error);
      setError('Failed to load promo details');
    }
  };

  const handleSubmit = async (data: Partial<PromoCode>) => {
    try {
      if (editingPromo) {
        await promos.update(editingPromo.id, data);
        setSuccess('Promo code updated successfully');
      } else {
        // Ensure required fields are present for creation
        if (!data.code || !data.maxActivations || !data.expiryDate || !data.tourId) {
          setError('Missing required fields');
          return;
        }
        
        await promos.create({
          code: data.code,
          maxActivations: data.maxActivations,
          expiryDate: data.expiryDate,
          tourId: data.tourId,
          active: true
        });
        setSuccess('Promo code created successfully');
      }
      await loadData();
      setShowCreate(false);
      setEditingPromo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promo code');
    }
  };

  const handleOpenEmailDialog = (promoId: string) => {
    setSelectedPromoId(promoId);
    setEmailDialogOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setEmailDialogOpen(false);
    setSelectedPromoId(null);
    setEmails('');
  };

  const handleSendEmails = async () => {
    if (!selectedPromoId || !emails.trim()) return;
    
    const emailList = emails.split(/[\s,;]+/).filter(email => email.trim());
    if (emailList.length === 0) return;

    try {
      setSendingEmails(true);
      await promos.sendEmails({ 
        promoCodeId: selectedPromoId, 
        emails: emailList 
      });
      setSuccess(`Promo code sent to ${emailList.length} email(s) successfully`);
      handleCloseEmailDialog();
    } catch (error) {
      console.error('Error sending emails:', error);
      setError('Failed to send emails');
    } finally {
      setSendingEmails(false);
    }
  };

  const getTourName = (tourId: string) => {
    const tour = toursList.find(tour => tour.id === tourId);
    return tour ? tour.title : 'Unknown Tour';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Promo Codes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingPromo(null);
            setShowCreate(!showCreate);
          }}
        >
          {showCreate ? 'Cancel' : 'Create Promo Code'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <PromoCodeForm 
            onSubmit={handleSubmit} 
            initialData={editingPromo || undefined}
            tours={toursList}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Promo Codes List"
          data={promoList}
          onDelete={handleDelete}
          onEdit={handleEdit}
          getItemTitle={(promo: PromoCode) => promo.code}
          getItemSubtitle={(promo: PromoCode) => (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: promo.active ? 'success.main' : 'error.main',
                  mr: 1
                }} 
              />
              {`${promo.active ? 'Active' : 'Inactive'} - ${promo.currentActivations}/${promo.maxActivations} activations - Expires: ${new Date(promo.expiryDate).toLocaleDateString()}`}
            </Box>
          )}
          getItemDetails={(promo: PromoCode) => ({
            ID: promo.id,
            Code: promo.code,
            'Max Activations': promo.maxActivations,
            'Current Activations': promo.currentActivations,
            'Expiry Date': new Date(promo.expiryDate).toLocaleString(),
            Status: (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box 
                  sx={{ 
                    width: 12, 
                    height: 12, 
                    borderRadius: '50%', 
                    bgcolor: promo.active ? 'success.main' : 'error.main',
                    mr: 1
                  }} 
                />
                {promo.active ? 'Active' : 'Inactive'}
              </Box>
            ),
            Tour: getTourName(promo.tourId),
          })}
          fetchFullDetails={async (id: string) => {
            return promoList.find(promo => promo.id === id) || promoList[0];
          }}
          extraActions={[
            {
              label: 'Send to Emails',
              icon: <SendIcon />,
              onClick: handleOpenEmailDialog
            }
          ]}
        />
      </Box>

      {/* Email Sending Dialog */}
      <Dialog open={emailDialogOpen} onClose={handleCloseEmailDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Send Promo Code to Emails</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="emails"
            label="Email Addresses"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter emails separated by commas, spaces, or new lines"
            helperText="Enter multiple email addresses separated by commas, spaces, or new lines"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEmailDialog} disabled={sendingEmails}>
            Cancel
          </Button>
          <Button 
            onClick={handleSendEmails} 
            color="primary" 
            variant="contained"
            disabled={sendingEmails || !emails.trim()}
            startIcon={<SendIcon />}
          >
            {sendingEmails ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
} 