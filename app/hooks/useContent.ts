'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  category: string | Category;
  createdAt: string;
  topics?: Topic[];
}

export interface Topic {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  subcategory: string | Subcategory;
  createdAt: string;
  letters?: Letter[];
}

export interface Letter {
  _id: string;
  title: string;
  content: string;
  topic: string | Topic;
  letter_type?: string;
  level?: string;
  full_code?: string;
  createdAt: string;
}

interface CreateCategoryData {
  name: string;
  description?: string;
}

interface CreateSubcategoryData {
  name: string;
  description?: string;
  category: string;
}

interface CreateTopicData {
  name: string;
  description?: string;
  subcategory: string;
}

interface CreateLetterData {
  title: string;
  content: string;
  topic: string;
}

// Get categories
export const useCategories = () => {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/public/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      if (Array.isArray(data.categories)) return data.categories;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subcategories
export const useSubcategories = () => {
  return useQuery<Subcategory[], Error>({
    queryKey: ['subcategories'],
    queryFn: async () => {
      const response = await fetch('/api/public/subcategories');
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      if (Array.isArray(data.subcategories)) return data.subcategories;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get topics
export const useTopics = () => {
  return useQuery<Topic[], Error>({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await fetch('/api/public/topics');
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      if (Array.isArray(data.topics)) return data.topics;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get letters
export const useLetters = () => {
  return useQuery<Letter[], Error>({
    queryKey: ['letters'],
    queryFn: async () => {
      const response = await fetch('/api/public/letters');
      if (!response.ok) {
        throw new Error('Failed to fetch letters');
      }
      const data = await response.json();
      if (Array.isArray(data.letters)) return data.letters;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get full content tree (categories with nested subcategories, topics, and letters)
export const useContentTree = () => {
  return useQuery<Category[], Error>({
    queryKey: ['contentTree'],
    queryFn: async () => {
      const response = await fetch('/api/public/content-tree');
      if (!response.ok) {
        throw new Error('Failed to fetch content tree');
      }
      const data = await response.json();
      if (Array.isArray(data.categories)) return data.categories;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get subcategories by category
export const useSubcategoriesByCategory = (categoryId: string) => {
  return useQuery<Subcategory[], Error>({
    queryKey: ['subcategories', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/public/subcategories?categoryId=${categoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch subcategories');
      }
      const data = await response.json();
      if (Array.isArray(data.subcategories)) return data.subcategories;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get topics by subcategory
export const useTopicsBySubcategory = (subcategoryId: string) => {
  return useQuery<Topic[], Error>({
    queryKey: ['topics', subcategoryId],
    queryFn: async () => {
      const response = await fetch(`/api/public/topics?subcategoryId=${subcategoryId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch topics');
      }
      const data = await response.json();
      if (Array.isArray(data.topics)) return data.topics;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
    enabled: !!subcategoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get letters by topic
export const useLettersByTopic = (topicId: string) => {
  return useQuery<Letter[], Error>({
    queryKey: ['letters', topicId],
    queryFn: async () => {
      const response = await fetch(`/api/public/letters?topicId=${topicId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch letters');
      }
      const data = await response.json();
      if (Array.isArray(data.letters)) return data.letters;
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    },
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
      const response = await fetch('/api/content/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create category');
      }
      
      const result = await response.json();
      return result.category;
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
      const response = await fetch('/api/content/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      const result = await response.json();
      return result.category;
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
      const response = await fetch('/api/content/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
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
      const response = await fetch('/api/content/subcategories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subcategory');
      }
      
      const result = await response.json();
      return result.subcategory;
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
      const response = await fetch('/api/content/subcategories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update subcategory');
      }
      
      const result = await response.json();
      return result.subcategory;
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
      const response = await fetch('/api/content/subcategories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subcategory');
      }
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
      const response = await fetch('/api/content/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create topic');
      }
      
      const result = await response.json();
      return result.topic;
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
      const response = await fetch('/api/content/topics', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update topic');
      }
      
      const result = await response.json();
      return result.topic;
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
      const response = await fetch('/api/content/topics', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete topic');
      }
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
      const response = await fetch('/api/content/letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create letter');
      }
      
      const result = await response.json();
      return result.letter;
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
      const response = await fetch('/api/content/letters', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update letter');
      }
      
      const result = await response.json();
      return result.letter;
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
      const response = await fetch('/api/content/letters', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete letter');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
};
