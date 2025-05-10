import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Add as AddIcon } from '@mui/icons-material';
import DataDisplay from '../components/DataDisplay';
import ArticleForm from '../components/forms/ArticleForm';
import { articles } from '../api/client';
import type { Article } from '../types/api';

export default function Articles() {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await articles.getAll();
      setArticlesList(response.data);
    } catch (error) {
      console.error('Error loading articles:', error);
      setError('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await articles.delete(id);
      setArticlesList(prev => prev.filter(article => article.id !== id));
      setSuccess('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article');
      throw error;
    }
  };

  const handleSubmit = async (data: Partial<Article>) => {
    try {
      const articleData = {
        title: data.title || '',
        articleType: data.articleType || 'HISTORICAL',
        mainImage: data.mainImage || '',
        contents: data.contents || [],
      };
      const response = await articles.create(articleData);
      await loadArticles();
      setShowCreate(false);
      setSuccess('Article created successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create article');
    }
  };

  const fetchFullDetails = async (id: string) => {
    try {
      const response = await articles.getById(id);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch article details:', error);
      throw error;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Articles
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : 'Create Article'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <ArticleForm onSubmit={handleSubmit} />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Articles List"
          data={articlesList}
          onDelete={handleDelete}
          getItemTitle={(article: Article) => article.title}
          getItemSubtitle={(article: Article) => `${article.articleType} - ${new Date(article.datePublished).toLocaleString()}`}
          getItemDetails={(article: Article) => ({
            ID: article.id,
            Type: article.articleType,
            'Main Image': article.mainImage,
            'Date Published': new Date(article.datePublished).toLocaleString(),
            Contents: article.contents || [],
          })}
          fetchFullDetails={fetchFullDetails}
        />
      </Box>

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