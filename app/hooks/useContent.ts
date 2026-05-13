'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface Category {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  category: Category;
  createdAt: string;
}

interface Topic {
  _id: string;
  name: string;
  description?: string;
  subcategory: Subcategory;
  createdAt: string;
}

interface Letter {
  _id: string;
  title: string;
  content: string;
  topic: Topic;
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
      return data.categories || [];
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
      return data.subcategories || [];
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
      return data.topics || [];
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
      return data.letters || [];
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
      return data.subcategories || [];
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
      return data.topics || [];
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
      return data.letters || [];
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
      const response = await fetch('/api/categories', {
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Category, Error, { id: string; data: Partial<CreateCategoryData> }>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update category');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
    },
  });
};

export const useCreateSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Subcategory, Error, CreateSubcategoryData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/subcategories', {
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subcategories'] });
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

export const useCreateTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Topic, Error, CreateTopicData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/topics', {
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
};

export const useCreateLetter = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Letter, Error, CreateLetterData>({
    mutationFn: async (data) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/letters', {
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
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letters'] });
    },
  });
};
