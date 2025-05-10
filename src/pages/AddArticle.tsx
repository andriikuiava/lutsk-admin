import { useState } from 'react';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArticleForm from '../components/forms/ArticleForm';
import { articles } from '../api/client';
import type { Article } from '../types/api';

export default function AddArticle() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: Partial<Article>) => {
    try {
      await articles.create(data);
      navigate('/articles');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Add New Article
      </Typography>

      <ArticleForm onSubmit={handleSubmit} />

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
} 