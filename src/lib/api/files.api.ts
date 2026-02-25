import { apiClient } from './client';

export const FilesAPI = {
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<{ url: string }>('/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};
