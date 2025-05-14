import { useState, useEffect } from 'react';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DataDisplay from '../components/DataDisplay';
import ArticleForm from '../components/forms/ArticleForm';
import { articles } from '../api/client';
import type { Article } from '../types/api';

export default function Articles() {
  const [showCreate, setShowCreate] = useState(false);
  const [articlesList, setArticlesList] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const navigate = useNavigate();

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

  const handleEdit = async (id: string) => {
    try {
      const response = await articles.getById(id);
      setEditingArticle(response.data);
      setShowCreate(true);
    } catch (error) {
      console.error('Error loading article details:', error);
      setError('Failed to load article details');
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

      if (editingArticle) {
        await articles.update(editingArticle.id, articleData);
        setSuccess('Article updated successfully');
      } else {
        await articles.create(articleData);
        setSuccess('Article created successfully');
      }
      await loadArticles();
      setShowCreate(false);
      setEditingArticle(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save article');
    }
  };

  const handleCancel = () => {
    setShowCreate(false);
    setEditingArticle(null);
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
          onClick={() => {
            setEditingArticle(null);
            setShowCreate(!showCreate);
          }}
        >
          {showCreate ? 'Cancel' : 'Create Article'}
        </Button>
      </Box>

      {showCreate && (
        <Box sx={{ mb: 3 }}>
          <ArticleForm 
            onSubmit={handleSubmit} 
            initialData={editingArticle || undefined}
          />
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <DataDisplay
          title="Articles List"
          data={articlesList}
          onDelete={handleDelete}
          onEdit={handleEdit}
          getItemTitle={(article: Article) => article.title}
          getItemSubtitle={(article: Article) => `${article.articleType} - ${new Date(article.datePublished).toLocaleString()}`}
          getItemDetails={(article: Article) => ({
            ID: article.id,
            Type: article.articleType,
            'Main Image': article.mainImage,
            'Date Published': new Date(article.datePublished).toLocaleString(),
            Contents: article.contents || [],
          })}
          fetchFullDetails={async (id: string) => {
            const response = await articles.getById(id);
            return response.data;
          }}
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