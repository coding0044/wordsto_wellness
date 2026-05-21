'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Category,
  Subcategory,
  Topic,
  Letter,
  CreateCategoryData,
  CreateSubcategoryData,
  CreateTopicData,
  CreateLetterData,
  getCategories,
  getSubcategories,
  getTopics,
  getLetters,
  getContentTree,
  getSubcategoriesByCategory,
  getTopicsBySubcategory,
  getLettersByTopic,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  createTopic,
  updateTopic,
  deleteTopic,
  createLetter,
  updateLetter,
  deleteLetter,
} from '@/services/contentService';

// Get categories
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subcategories
export const useSubcategories = () => {
  return useQuery<Subcategory[], Error>({
    queryKey: ['subcategories'],
    queryFn: getSubcategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get topics
export const useTopics = () => {
  return useQuery<Topic[], Error>({
    queryKey: ['topics'],
    queryFn: getTopics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get letters
export const useLetters = () => {
  return useQuery<Letter[], Error>({
    queryKey: ['letters'],
    queryFn: getLetters,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get full content tree (categories with nested subcategories, topics, and letters)
export const useContentTree = () => {
  return useQuery<Category[], Error>({
    queryKey: ['contentTree'],
    queryFn: getContentTree,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subcategories by category
export const useSubcategoriesByCategory = (categoryId: string) => {
  return useQuery<Subcategory[], Error>({
    queryKey: ['subcategories', categoryId],
    queryFn: () => getSubcategoriesByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get topics by subcategory
export const useTopicsBySubcategory = (subcategoryId: string) => {
  return useQuery<Topic[], Error>({
    queryKey: ['topics', subcategoryId],
    queryFn: () => getTopicsBySubcategory(subcategoryId),
    enabled: !!subcategoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get letters by topic
export const useLettersByTopic = (topicId: string) => {
  return useQuery<Letter[], Error>({
    queryKey: ['letters', topicId],
    queryFn: () => getLettersByTopic(topicId),
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Admin mutations
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, CreateCategoryData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return createCategory(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Category, Error, { id: string; data: Partial<CreateCategoryData> }>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return updateCategory(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return deleteCategory(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Subcategory, Error, CreateSubcategoryData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return createSubcategory(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useUpdateSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation<Subcategory, Error, { id: string; data: Partial<CreateSubcategoryData> }>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return updateSubcategory(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useDeleteSubcategory = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return deleteSubcategory(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<Topic, Error, CreateTopicData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return createTopic(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<Topic, Error, { id: string; data: Partial<CreateTopicData> }>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return updateTopic(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return deleteTopic(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useCreateLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<Letter, Error, CreateLetterData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return createLetter(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useUpdateLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<Letter, Error, { id: string; data: Partial<CreateLetterData> }>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return updateLetter(id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};

export const useDeleteLetter = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found');
      }
      return deleteLetter(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
      queryClient.invalidateQueries({ queryKey: ['contentTree'] });
    },
  });
};
