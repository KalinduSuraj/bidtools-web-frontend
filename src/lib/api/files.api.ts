import { apiClient } from './client';

export const FilesAPI = {
    /** POST /files - Upload a file */
    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post<{ url: string }>('/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    /** GET /files/:key - Get a file by key */
    getFile: async (key: string) =>
        apiClient.get(`/files/${encodeURIComponent(key)}`),
};
