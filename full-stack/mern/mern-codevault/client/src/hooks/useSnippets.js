import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api';
import toast from 'react-hot-toast';

export const useSnippets = (fetchUrl, params, search) => {
    return useQuery({
        queryKey: ['snippets', fetchUrl, params, search],
        queryFn: async () => {
            const res = await api.get(fetchUrl, { params: { ...params, search } });
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes configurable caching
    });
};

export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const res = await api.patch(`/snippets/${id}/favorite`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
        },
        onError: () => {
            toast.error('Failed to toggle important status.');
        }
    });
};

export const useDeleteSnippet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            await api.delete(`/snippets/${id}`);
        },
        onSuccess: () => {
            toast.success('Snippet deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
        },
        onError: () => {
            toast.error('Failed to delete snippet.');
        }
    });
};

export const useSaveSnippet = (isEditing) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }) => {
            if (isEditing) {
                return await api.put(`/snippets/${id}`, data);
            } else {
                return await api.post(`/snippets`, data);
            }
        },
        onSuccess: () => {
            toast.success(isEditing ? 'Snippet updated!' : 'Snippet created!');
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
        },
        onError: (error) => {
            const msgs = error.response?.data?.errors?.map(e => e.message).join(', ') || 'Failed to save snippet';
            toast.error(msgs);
        }
    });
};
