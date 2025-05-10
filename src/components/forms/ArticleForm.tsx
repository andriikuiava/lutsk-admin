import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import type { Article, ArticleContent } from '../../types/api';

type ContentType = 'TEXT' | 'IMAGE' | 'AUDIO';

interface ArticleFormProps {
  onSubmit: (data: Partial<Article>) => Promise<void>;
  initialData?: Partial<Article>;
}

export default function ArticleForm({ onSubmit, initialData }: ArticleFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [articleType, setArticleType] = useState(initialData?.articleType || 'HISTORICAL');
  const [mainImage, setMainImage] = useState(initialData?.mainImage || '');
  const [contents, setContents] = useState<ArticleContent[]>(initialData?.contents || [
    {
      contentType: 'TEXT',
      title: '',
      text: '',
      imageUrl: null,
      audioUrl: null,
      position: 1,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title,
      articleType,
      mainImage,
      contents,
    });
  };

  const addContent = () => {
    setContents([
      ...contents,
      {
        contentType: 'TEXT',
        title: '',
        text: '',
        imageUrl: null,
        audioUrl: null,
        position: contents.length + 1,
      },
    ]);
  };

  const removeContent = (index: number) => {
    setContents(contents.filter((_, i) => i !== index).map((content, i) => ({
      ...content,
      position: i + 1,
    })));
  };

  const updateContent = (index: number, field: string, value: any) => {
    const newContents = [...contents];
    newContents[index] = {
      ...newContents[index],
      [field]: value,
    };
    setContents(newContents);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Article Type</InputLabel>
          <Select
            value={articleType}
            label="Article Type"
            onChange={(e) => setArticleType(e.target.value)}
          >
            <MenuItem value="HISTORICAL">Historical</MenuItem>
            <MenuItem value="CULTURAL">Cultural</MenuItem>
            <MenuItem value="TRAVEL">Travel</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Main Image URL"
          value={mainImage}
          onChange={(e) => setMainImage(e.target.value)}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Contents</Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={addContent}
            variant="outlined"
          >
            Add Content
          </Button>
        </Box>

        {contents.map((content, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1">Content {index + 1}</Typography>
              <IconButton
                onClick={() => removeContent(index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>

            <Box sx={{ mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Content Type</InputLabel>
                <Select
                  value={content.contentType}
                  label="Content Type"
                  onChange={(e) => updateContent(index, 'contentType', e.target.value)}
                >
                  <MenuItem value="TEXT">Text</MenuItem>
                  <MenuItem value="IMAGE">Image</MenuItem>
                  <MenuItem value="AUDIO">Audio</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={content.title || ''}
                onChange={(e) => updateContent(index, 'title', e.target.value)}
              />
            </Box>

            {content.contentType === 'TEXT' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Text"
                  value={content.text || ''}
                  onChange={(e) => updateContent(index, 'text', e.target.value)}
                />
              </Box>
            )}

            {content.contentType === 'IMAGE' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Image URL"
                  value={content.imageUrl || ''}
                  onChange={(e) => updateContent(index, 'imageUrl', e.target.value)}
                />
              </Box>
            )}

            {content.contentType === 'AUDIO' && (
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="Audio URL"
                  value={content.audioUrl || ''}
                  onChange={(e) => updateContent(index, 'audioUrl', e.target.value)}
                />
              </Box>
            )}
          </Paper>
        ))}
      </Box>

      <Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
        >
          {initialData ? 'Update Article' : 'Create Article'}
        </Button>
      </Box>
    </Box>
  );
} 