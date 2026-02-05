import { apiClient } from './client';
import { Return, CreateReturnDto } from '../types';

export const returnsApi = {
  create: (data: CreateReturnDto) =>
    apiClient.post<Return>('/returns', data),

  list: (partnerId?: string) =>
    apiClient.get<Return[]>(`/returns${partnerId ? `?partnerId=${partnerId}` : ''}`),

  get: (id: string) =>
    apiClient.get<Return>(`/returns/${id}`),

  uploadPhoto: async (uri: string): Promise<string> => {
    // In a real implementation, this would upload to a cloud storage service (S3, Cloudinary, etc.)
    // For now, we'll just return the local URI
    // TODO: Implement actual photo upload
    return uri;
  },
};
