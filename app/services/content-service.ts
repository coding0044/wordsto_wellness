import { fetchJson, jsonHeaders, authHeaders } from '@/lib/api';
import { ApiRoutes } from '@/lib/urls';

export interface Category {
  _id: string;
  name: string;
  slug?: string;
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

export interface CreateCategoryData {
  name: string;
  description?: string;
  slug?: string;
}

export interface CreateSubcategoryData {
  name: string;
  description?: string;
  category: string;
  slug?: string;
}

export interface CreateTopicData {
  name: string;
  description?: string;
  subcategory: string;
  slug?: string;
}

export interface CreateLetterData {
  title: string;
  content: string;
  topic: string;
  letter_type?: string;
  level?: string;
  full_code?: string;
}

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const typed = data as Record<string, unknown>;
    if (Array.isArray(typed.categories)) return typed.categories as T[];
    if (Array.isArray(typed.subcategories)) return typed.subcategories as T[];
    if (Array.isArray(typed.topics)) return typed.topics as T[];
    if (Array.isArray(typed.letters)) return typed.letters as T[];
    if (Array.isArray(typed.data)) return typed.data as T[];
  }
  return [];
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetchJson(ApiRoutes.public.categories);
  return normalizeList<Category>(response);
}

export async function getSubcategories(): Promise<Subcategory[]> {
  const response = await fetchJson(ApiRoutes.public.subcategories);
  return normalizeList<Subcategory>(response);
}

export async function getTopics(): Promise<Topic[]> {
  const response = await fetchJson(ApiRoutes.public.topics);
  return normalizeList<Topic>(response);
}

export async function getLetters(): Promise<Letter[]> {
  const response = await fetchJson(ApiRoutes.public.letters);
  return normalizeList<Letter>(response);
}

export async function getContentTree(): Promise<Category[]> {
  const response = await fetchJson(ApiRoutes.public.contentTree);
  return normalizeList<Category>(response);
}

export async function getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
  const response = await fetchJson(`${ApiRoutes.public.subcategories}?categoryId=${encodeURIComponent(categoryId)}`);
  return normalizeList<Subcategory>(response);
}

export async function getTopicsBySubcategory(subcategoryId: string): Promise<Topic[]> {
  const response = await fetchJson(`${ApiRoutes.public.topics}?subcategoryId=${encodeURIComponent(subcategoryId)}`);
  return normalizeList<Topic>(response);
}

export async function getLettersByTopic(topicId: string): Promise<Letter[]> {
  const response = await fetchJson(`${ApiRoutes.public.letters}?topicId=${encodeURIComponent(topicId)}`);
  return normalizeList<Letter>(response);
}

export async function createCategory(data: CreateCategoryData, token: string): Promise<Category> {
  return fetchJson<{ category: Category }>(ApiRoutes.content.categories, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((response) => response.category);
}

export async function updateCategory(id: string, data: Partial<CreateCategoryData>, token: string): Promise<Category> {
  return fetchJson<{ category: Category }>(ApiRoutes.content.categories, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id, ...data }),
  }).then((response) => response.category);
}

export async function deleteCategory(id: string, token: string): Promise<void> {
  await fetchJson(ApiRoutes.content.categories, {
    method: 'DELETE',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id }),
  });
}

export async function createSubcategory(data: CreateSubcategoryData, token: string): Promise<Subcategory> {
  return fetchJson<{ subcategory: Subcategory }>(ApiRoutes.content.subcategories, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((response) => response.subcategory);
}

export async function updateSubcategory(id: string, data: Partial<CreateSubcategoryData>, token: string): Promise<Subcategory> {
  return fetchJson<{ subcategory: Subcategory }>(ApiRoutes.content.subcategories, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id, ...data }),
  }).then((response) => response.subcategory);
}

export async function deleteSubcategory(id: string, token: string): Promise<void> {
  await fetchJson(ApiRoutes.content.subcategories, {
    method: 'DELETE',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id }),
  });
}

export async function createTopic(data: CreateTopicData, token: string): Promise<Topic> {
  return fetchJson<{ data: Topic }>(ApiRoutes.content.topics, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((response) => response.data);
}

export async function updateTopic(id: string, data: Partial<CreateTopicData>, token: string): Promise<Topic> {
  return fetchJson<{ data: Topic }>(ApiRoutes.content.topics, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id, ...data }),
  }).then((response) => response.data);
}

export async function deleteTopic(id: string, token: string): Promise<void> {
  await fetchJson(ApiRoutes.content.topics, {
    method: 'DELETE',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id }),
  });
}

export async function createLetter(data: CreateLetterData, token: string): Promise<Letter> {
  return fetchJson<{ letter: Letter }>(ApiRoutes.content.letters, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify(data),
  }).then((response) => response.letter);
}

export async function updateLetter(id: string, data: Partial<CreateLetterData>, token: string): Promise<Letter> {
  return fetchJson<{ letter: Letter }>(ApiRoutes.content.letters, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id, ...data }),
  }).then((response) => response.letter);
}

export async function deleteLetter(id: string, token: string): Promise<void> {
  await fetchJson(ApiRoutes.content.letters, {
    method: 'DELETE',
    headers: jsonHeaders(token),
    body: JSON.stringify({ id }),
  });
}
