import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { customCategoryService } from '../services/customCategoryService';
import type { CustomCategoryTemplate, CustomFieldDefinition, CustomFieldType, CategoryTemplateType } from '../types/models';

const customFieldTypeOptions: CustomFieldType[] = [
  'text',
  'number',
  'currency',
  'date',
  'url',
  'email',
  'phone',
  'textarea',
  'percentage',
];

const customFieldTypeLabels: Record<CustomFieldType, string> = {
  text: 'Text',
  number: 'Number',
  currency: 'Currency (₹)',
  date: 'Date',
  url: 'URL/Link',
  email: 'Email',
  phone: 'Phone',
  textarea: 'Text Area',
  percentage: 'Percentage (%)',
};

export const CustomCategoriesPage = () => {
  const [templates, setTemplates] = useState<CustomCategoryTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<CategoryTemplateType>('asset');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomCategoryTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  
  // Form state
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryTemplateType>('asset');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [customFields, setCustomFields] = useState<Omit<CustomFieldDefinition, 'value'>[]>([]);
  const [error, setError] = useState('');

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const loadedTemplates = await customCategoryService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (error) {
      console.error('Failed to load custom categories', error);
      setFetchError('Failed to load custom categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTemplates();
  }, []);

  const handleOpenDialog = (template?: CustomCategoryTemplate) => {
    if (template) {
      // Edit mode
      setEditingTemplate(template);
      setCategoryName(template.name);
      setCategoryType(template.categoryType);
      setCategoryDescription(template.description || '');
      setCustomFields(template.fields);
    } else {
      // Create mode - use active tab as default category type
      setEditingTemplate(null);
      setCategoryName('');
      setCategoryType(activeTab);
      setCategoryDescription('');
      setCustomFields([]);
    }
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setCategoryName('');
    setCategoryType('asset');
    setCategoryDescription('');
    setCustomFields([]);
    setError('');
  };

  const handleAddField = () => {
    const newField: Omit<CustomFieldDefinition, 'value'> = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type: 'text',
      required: false,
    };
    setCustomFields((prev) => [...prev, newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== fieldId));
  };

  const handleFieldChange = (fieldId: string, updates: Partial<Omit<CustomFieldDefinition, 'value'>>) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
  };

  const handleSave = async () => {
    // Validation
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    if (customFields.length === 0) {
      setError('Please add at least one field');
      return;
    }

    const hasEmptyFieldNames = customFields.some((field) => !field.name.trim());
    if (hasEmptyFieldNames) {
      setError('All fields must have a name');
      return;
    }

    try {
      const sanitizedFields = customFields.map((field) => ({
        ...field,
        name: field.name.trim(),
        placeholder: field.placeholder?.trim() || undefined,
      }));

      const payload = {
        name: categoryName.trim(),
        categoryType,
        description: categoryDescription.trim() ? categoryDescription.trim() : undefined,
        fields: sanitizedFields,
      };

      if (editingTemplate) {
        // Update existing
        await customCategoryService.updateTemplate(editingTemplate.id, payload);
      } else {
        // Create new
        await customCategoryService.createTemplate(payload);
      }
      await loadTemplates();
      handleCloseDialog();
    } catch (err) {
      const message = (err as Error)?.message || 'Failed to save custom category';
      setError(message);
    }
  };

  const handleDelete = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this custom category? This action cannot be undone.')) {
      customCategoryService.deleteTemplate(templateId)
        .then(() => loadTemplates())
        .catch((error) => {
          console.error('Failed to delete custom category', error);
          setFetchError('Failed to delete custom category. Please try again.');
        });
    }
  };

  const filteredTemplates = templates.filter((t) => t.categoryType === activeTab);

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Custom Categories
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Create and manage reusable asset and liability categories with custom fields
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<i className="ri-add-line" />}
          onClick={() => handleOpenDialog()}
          color={activeTab === 'asset' ? 'primary' : 'error'}
          disabled={loading}
        >
          Create {activeTab === 'asset' ? 'Asset' : 'Liability'} Category
        </Button>
      </Box>

      {/* Info Alert */}
      <Alert severity="info">
        Custom categories allow you to track any type of asset or liability with fields you define. Once created, they'll appear as options when adding new assets or liabilities. <strong>Note:</strong> Document upload, document URL, and notes are automatically available for all custom categories.
      </Alert>

      {fetchError && (
        <Alert severity="error" onClose={() => setFetchError('')}>
          {fetchError}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue as CategoryTemplateType)}
          aria-label="category type tabs"
        >
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <i className="ri-money-dollar-circle-line" />
                <span>Asset Categories</span>
                <Chip 
                  label={templates.filter(t => t.categoryType === 'asset').length} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, minWidth: 20 }}
                />
              </Stack>
            }
            value="asset" 
          />
          <Tab 
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <i className="ri-bank-card-line" />
                <span>Liability Categories</span>
                <Chip 
                  label={templates.filter(t => t.categoryType === 'liability').length} 
                  size="small" 
                  color="error"
                  sx={{ height: 20, minWidth: 20 }}
                />
              </Stack>
            }
            value="liability" 
          />
        </Tabs>
      </Box>

      {/* Templates Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredTemplates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <i className="ri-folder-add-line" style={{ fontSize: '64px', color: '#bdbdbd' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            No custom categories yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create your first {activeTab} category to start tracking unique {activeTab} types
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 3 }}
            onClick={() => handleOpenDialog()}
          >
            Create Your First {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Category
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {template.name}
                      </Typography>
                      <Chip 
                        label={template.categoryType === 'asset' ? 'Asset' : 'Liability'} 
                        size="small"
                        color={template.categoryType === 'asset' ? 'primary' : 'secondary'}
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    </Stack>
                    {template.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {template.description}
                      </Typography>
                    )}
                  </Box>
                  <i className={template.icon || (template.categoryType === 'asset' ? 'ri-briefcase-line' : 'ri-bank-card-line')} style={{ fontSize: '24px', color: template.categoryType === 'asset' ? '#2196f3' : '#9c27b0' }} />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1 }}>
                  {template.fields.length} Custom Field{template.fields.length !== 1 ? 's' : ''}
                </Typography>

                <Stack spacing={0.5}>
                  {template.fields.slice(0, 4).map((field) => (
                    <Box key={field.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={customFieldTypeLabels[field.type]}
                        size="small"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                      <Typography variant="body2">
                        {field.name}
                        {field.required && <span style={{ color: '#d32f2f' }}> *</span>}
                      </Typography>
                    </Box>
                  ))}
                  {template.fields.length > 4 && (
                    <Typography variant="caption" color="text.secondary">
                      + {template.fields.length - 4} more field{template.fields.length - 4 !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Stack>
              </CardContent>

              <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<i className="ri-edit-line" />}
                  onClick={() => handleOpenDialog(template)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<i className="ri-delete-bin-line" />}
                  onClick={() => handleDelete(template.id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Custom Category' : 'Create Custom Category'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Vehicle, Jewelry, Student Loan, Medical Bill"
              fullWidth
              required
            />

            <TextField
              label="Category Type"
              select
              value={categoryType}
              onChange={(e) => setCategoryType(e.target.value as CategoryTemplateType)}
              fullWidth
              required
              disabled={!!editingTemplate}
              helperText={editingTemplate ? "Category type cannot be changed" : "Select whether this is an asset or liability category"}
            >
              <MenuItem value="asset">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <i className="ri-briefcase-line" style={{ fontSize: '18px', color: '#2196f3' }} />
                  <Typography>Asset Category</Typography>
                </Stack>
              </MenuItem>
              <MenuItem value="liability">
                <Stack direction="row" alignItems="center" spacing={1}>
                  <i className="ri-bank-card-line" style={{ fontSize: '18px', color: '#9c27b0' }} />
                  <Typography>Liability Category</Typography>
                </Stack>
              </MenuItem>
            </TextField>

            <TextField
              label="Description (Optional)"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
              placeholder="Brief description of this category"
              fullWidth
              multiline
              minRows={2}
            />

            <Divider />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Custom Fields</Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddField}
                startIcon={<i className="ri-add-line" />}
              >
                Add Field
              </Button>
            </Box>

            {customFields.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 3, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  No fields yet. Click "Add Field" to create your first field.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {customFields.map((field, index) => (
                  <Box
                    key={field.id}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Chip
                        label={`Field ${index + 1}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveField(field.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <i className="ri-delete-bin-line" style={{ fontSize: '18px' }} />
                      </IconButton>
                    </Box>

                    <Stack spacing={1.5}>
                      <TextField
                        label="Field Name"
                        value={field.name}
                        onChange={(e) => handleFieldChange(field.id, { name: e.target.value })}
                        placeholder="e.g., Serial Number, Warranty Period"
                        size="small"
                        fullWidth
                        required
                      />

                      <TextField
                        label="Field Type"
                        select
                        value={field.type}
                        onChange={(e) =>
                          handleFieldChange(field.id, { type: e.target.value as CustomFieldType })
                        }
                        size="small"
                        fullWidth
                      >
                        {customFieldTypeOptions.map((type) => (
                          <MenuItem key={type} value={type}>
                            {customFieldTypeLabels[type]}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Placeholder (Optional)"
                        value={field.placeholder || ''}
                        onChange={(e) => handleFieldChange(field.id, { placeholder: e.target.value })}
                        placeholder="Hint text for this field"
                        size="small"
                        fullWidth
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Required field?
                        </Typography>
                        <Button
                          size="small"
                          variant={field.required ? 'contained' : 'outlined'}
                          onClick={() => handleFieldChange(field.id, { required: !field.required })}
                          sx={{ minWidth: 60 }}
                        >
                          {field.required ? 'Yes' : 'No'}
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="text" onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingTemplate ? 'Save Changes' : 'Create Category'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default CustomCategoriesPage;

