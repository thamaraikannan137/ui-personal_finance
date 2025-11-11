import type {
  CategoryTemplateType,
  CustomCategoryTemplate,
  CustomFieldDefinition,
} from '../types/models';
import { apiClient } from './api';
import { API_ENDPOINTS } from '../config/constants';

interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

interface CustomCategoryPayload {
  name: string;
  categoryType: CategoryTemplateType;
  description?: string;
  icon?: string;
  fields: Omit<CustomFieldDefinition, 'value'>[];
}

const sanitizeFields = (
  fields: Omit<CustomFieldDefinition, 'value'>[],
): Omit<CustomFieldDefinition, 'value'>[] =>
  fields.map((field) => ({
    id: field.id,
    name: field.name,
    type: field.type,
    required: field.required ?? false,
    placeholder: field.placeholder,
  }));

class CustomCategoryService {
  async getTemplates(categoryType?: CategoryTemplateType): Promise<CustomCategoryTemplate[]> {
    const query = categoryType ? `?type=${categoryType}` : '';
    const response = await apiClient.get<
      ApiSuccess<{ templates: CustomCategoryTemplate[] }>
    >(`${API_ENDPOINTS.CUSTOM_CATEGORIES}${query}`);
    return response.data?.templates ?? [];
  }

  async createTemplate(payload: CustomCategoryPayload): Promise<CustomCategoryTemplate> {
    const response = await apiClient.post<
      ApiSuccess<{ template: CustomCategoryTemplate }>
    >(API_ENDPOINTS.CUSTOM_CATEGORIES, {
      ...payload,
      fields: sanitizeFields(payload.fields),
    });
    return response.data.template;
  }

  async updateTemplate(
    id: string,
    updates: Partial<CustomCategoryPayload>,
  ): Promise<CustomCategoryTemplate> {
    const response = await apiClient.put<
      ApiSuccess<{ template: CustomCategoryTemplate }>
    >(
      API_ENDPOINTS.CUSTOM_CATEGORY_BY_ID(id),
      updates.fields ? { ...updates, fields: sanitizeFields(updates.fields) } : updates,
    );
    return response.data.template;
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete<ApiSuccess<null>>(API_ENDPOINTS.CUSTOM_CATEGORY_BY_ID(id));
  }

  createFieldsFromTemplate(template: CustomCategoryTemplate): CustomFieldDefinition[] {
    return template.fields.map((field) => ({
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value: null,
    }));
  }
}

export const customCategoryService = new CustomCategoryService();

