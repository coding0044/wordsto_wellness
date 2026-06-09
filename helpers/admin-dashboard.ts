import { BookOpen, FileText, FolderTree, Layers, type LucideIcon, Users } from 'lucide-react';
import { calculateTotalPages, getPaginatedItems, getPageNumbers } from './pagination';

export { calculateTotalPages, getPaginatedItems, getPageNumbers };

export type AdminItem = Record<string, any>;
export type MutationMap = Record<string, any>;

export function formatDate(value: string | number | Date | null | undefined): string {
  if (!value) return 'N/A';
  let d = new Date(value);
  if (isNaN(d.getTime())) {
    const alt = String(value).replace(' ', 'T');
    d = new Date(alt);
    if (isNaN(d.getTime())) return 'N/A';
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getMutationMap(deleteCategory: any, deleteSubcategory: any, deleteTopic: any, deleteLetter: any): MutationMap {
  return {
    category: deleteCategory,
    subcategory: deleteSubcategory,
    topic: deleteTopic,
    letter: deleteLetter,
  };
}

export function getPaginationKey(type: string): string {
  const keyMap: Record<string, string> = {
    category: 'categories',
    subcategory: 'subcategories',
    topic: 'topics',
    letter: 'letters',
    user: 'users',
  };
  return keyMap[type] || `${type}s`;
}

export function getDataByTab(tab: string, categories: AdminItem[], subcategories: AdminItem[], topics: AdminItem[], letters: AdminItem[], users: AdminItem[]): AdminItem[] {
  const dataMap: Record<string, AdminItem[]> = {
    categories,
    subcategories,
    topics,
    letters,
    users,
  };

  return dataMap[tab] || [];
}

export function getPaginatedData(data: AdminItem[], tab: string, searchQuery: string, pagination: Record<string, { page: number; itemsPerPage: number }>) {
  const filtered = filterBySearchQuery(data, tab, searchQuery);
  const { page, itemsPerPage } = pagination[tab];
  const items = getPaginatedItems(filtered, page, itemsPerPage);
  const totalPages = calculateTotalPages(filtered.length, itemsPerPage);

  return { items, totalPages, totalItems: filtered.length };
}

export function getEmptyMessage(type: string): string {
  const messages: Record<string, string> = {
    users: 'No users found',
    categories: 'No categories yet. Add a category to see it here.',
    subcategories: 'No subcategories yet',
    topics: 'No topics yet',
    letters: 'No letters yet',
  };
  return messages[type] || 'No items found';
}

export function getTableIcon(type: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
    users: Users,
    categories: Layers,
    subcategories: FolderTree,
    topics: BookOpen,
    letters: FileText,
  };

  return iconMap[type] || FileText;
}

export function getTableColumns(type: string): string[] {
  const columnsMap: Record<string, string[]> = {
    users: ['User', 'Email', 'Role', 'Joined', 'Actions'],
    categories: ['Category', 'Description', 'Created', 'Actions'],
    subcategories: ['Subcategory', 'Description', 'Created', 'Actions'],
    topics: ['Topic', 'Description', 'Created', 'Actions'],
    letters: ['Letter', 'Type', 'Content Preview', 'Created', 'Actions'],
  };
  return columnsMap[type] || ['Name', 'Description', 'Created', 'Actions'];
}

export function isAdminUser(user?: AdminItem): boolean {
  return Boolean(user?.role === 'admin');
}

export function getUserInitials(name?: string): string {
  return name?.charAt(0).toUpperCase() || 'U';
}

export function getAvatarGradient(type: string): string {
  const gradientMap: Record<string, string> = {
    user: 'from-indigo-500 to-purple-500',
    category: 'from-blue-500 to-cyan-500',
    subcategory: 'from-emerald-500 to-teal-500',
    topic: 'from-amber-500 to-orange-500',
    letter: 'from-rose-500 to-pink-500',
  };
  return gradientMap[type] || 'from-gray-500 to-gray-600';
}

export function getRoleBadgeStyles(role?: string) {
  return {
    bg: role === 'admin' ? 'purple-50' : 'blue-50',
    text: role === 'admin' ? 'purple-700' : 'blue-700',
  };
}

export function filterBySearchQuery(items: AdminItem[], tab: string, searchQuery: string): AdminItem[] {
  if (!searchQuery) return items;
  const searchLower = searchQuery.toLowerCase();

  return items.filter((item) => {
    if (tab === 'users') {
      return item.name?.toLowerCase().includes(searchLower) || item.email?.toLowerCase().includes(searchLower);
    }
    if (tab === 'letters') {
      return item.title?.toLowerCase().includes(searchLower);
    }
    return item.name?.toLowerCase().includes(searchLower);
  });
}


export function createFormDataFromItem(item: AdminItem, type: string): AdminItem {
  const baseData: AdminItem = {
    id: item._id,
    name: item.name || '',
    email: item.email || '',
    role: item.role || 'user',
    password: '',
    description: item.description || '',
    slug: item.slug || '',
  };

  if (type === 'subcategory') {
    return {
      ...baseData,
      category: item.category?._id || item.category?.id || item.category || '',
    };
  }

  if (type === 'topic') {
    return {
      ...baseData,
      subcategory: item.subcategory?._id || item.subcategory?.id || item.subcategory || '',
    };
  }

  if (type === 'letter') {
    return {
      title: item.title || '',
      content: item.content || '',
      topic: item.topic?._id || item.topic?.id || item.topic || '',
      letter_type: item.letter_type || '',
      level: item.level || '',
      full_code: item.full_code || '',
    };
  }

  if (type === 'user') {
    return {
      ...baseData,
      email: item.email || '',
      role: item.role || 'user',
    };
  }

  return baseData;
}

export function getFormFields(formType: string, categories: AdminItem[], subcategories: AdminItem[], topics: AdminItem[]): AdminItem[] {
  const fields: Record<string, AdminItem[]> = {
    user: [
      { name: 'name', label: 'Name *', type: 'text', placeholder: 'Enter user name', required: true },
      { name: 'email', label: 'Email *', type: 'email', placeholder: 'Enter email address', required: true },
      { name: 'password', label: 'Password *', type: 'password', placeholder: 'Enter password', required: true, optionalWhenEditing: true },
      { name: 'role', label: 'Role *', type: 'select', options: ['user', 'admin'], required: true },
    ],
    category: [
      { name: 'name', label: 'Name *', type: 'text', placeholder: 'Enter category name', required: true },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'URL-friendly identifier (optional)' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description…', rows: 3 },
    ],
    subcategory: [
      { name: 'category', label: 'Category *', type: 'select', options: categories, required: true, optionKey: '_id', optionLabel: 'name' },
      { name: 'name', label: 'Name *', type: 'text', placeholder: 'Enter subcategory name', required: true },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'URL-friendly identifier (optional)' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description…', rows: 3 },
    ],
    topic: [
      { name: 'subcategory', label: 'Subcategory *', type: 'select', options: subcategories, required: true, optionKey: '_id', optionLabel: 'name' },
      { name: 'name', label: 'Name *', type: 'text', placeholder: 'Enter topic name', required: true },
      { name: 'slug', label: 'Slug', type: 'text', placeholder: 'URL-friendly identifier (optional)' },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description…', rows: 3 },
    ],
    letter: [
      { name: 'topic', label: 'Topic *', type: 'select', options: topics, required: true, optionKey: '_id', optionLabel: 'name' },
      { name: 'title', label: 'Title *', type: 'text', placeholder: 'Enter letter title', required: true },
      { name: 'letter_type', label: 'Letter Type', type: 'text', placeholder: 'e.g., A, B, C' },
      { name: 'level', label: 'Level', type: 'text', placeholder: 'e.g., a, b, c' },
      { name: 'full_code', label: 'Full Code', type: 'text', placeholder: 'e.g., A_a' },
      { name: 'content', label: 'Content *', type: 'textarea', placeholder: 'Write the letter content…', rows: 6, required: true },
    ],
  };

  return fields[formType] || [];
}

export function prepareMutationData(formType: string, formData: AdminItem, editingItem?: AdminItem): AdminItem {
  if (formType === 'user') {
    const data: AdminItem = { name: formData.name, email: formData.email, role: formData.role };
    if (formData.password) data.password = formData.password;
    return data;
  }

  if (formType === 'category') {
    return { name: formData.name, slug: formData.slug, description: formData.description };
  }

  if (formType === 'subcategory') {
    return { name: formData.name, slug: formData.slug, description: formData.description, category: formData.category };
  }

  if (formType === 'topic') {
    return { name: formData.name, slug: formData.slug, description: formData.description, subcategory: formData.subcategory };
  }

  if (formType === 'letter') {
    return {
      title: formData.title,
      content: formData.content,
      topic: formData.topic,
      letter_type: formData.letter_type,
      level: formData.level,
      full_code: formData.full_code,
    };
  }

  return formData;
}

export function calculateStats(users: AdminItem[], letters: AdminItem[], categories: AdminItem[], topics: AdminItem[]) {
  return [
    { label: 'Total Users', value: users.length, icon: Users, from: 'indigo', to: 'purple', light: 'indigo-50', text: 'indigo-700', color: 'indigo-500' },
    { label: 'Total Letters', value: letters.length, icon: FileText, from: 'emerald', to: 'teal', light: 'emerald-50', text: 'emerald-700', color: 'emerald-500' },
    { label: 'Categories', value: categories.length, icon: Layers, from: 'blue', to: 'cyan', light: 'blue-50', text: 'blue-700', color: 'blue-500' },
    { label: 'Topics', value: topics.length, icon: BookOpen, from: 'amber', to: 'orange', light: 'amber-50', text: 'amber-700', color: 'amber-500' },
  ];
}

export function getContentBreakdownItems(categories: AdminItem[], subcategories: AdminItem[], topics: AdminItem[], letters: AdminItem[]) {
  const total = categories.length + subcategories.length + topics.length + letters.length || 1;

  return [
    { label: 'Categories', value: categories.length, color: 'indigo', total, percentage: Math.round((categories.length / total) * 100) },
    { label: 'Subcategories', value: subcategories.length, color: 'emerald', total, percentage: Math.round((subcategories.length / total) * 100) },
    { label: 'Topics', value: topics.length, color: 'sky', total, percentage: Math.round((topics.length / total) * 100) },
    { label: 'Letters', value: letters.length, color: 'amber', total, percentage: Math.round((letters.length / total) * 100) },
  ];
}

export function getQuickActionsItems() {
  return [
    { label: 'Add User', type: 'user', from: 'violet', to: 'purple' },
    { label: 'Add Category', type: 'category', from: 'blue', to: 'cyan' },
    { label: 'Add Subcategory', type: 'subcategory', from: 'emerald', to: 'teal' },
    { label: 'Add Topic', type: 'topic', from: 'amber', to: 'orange' },
    { label: 'Add Letter', type: 'letter', from: 'rose', to: 'pink' },
  ];
}

export function getSuccessMessage(type: string, action: string): string {
  const typeName = type.charAt(0).toUpperCase() + type.slice(1);
  const messages: Record<string, string> = {
    create: `${typeName} created successfully`,
    update: `${typeName} updated successfully`,
    delete: `${typeName} deleted successfully`,
  };
  return messages[action] || `${action} ${type} completed`;
}

export function resetPaginationForTab(setPagination: any, tab: string) {
  setPagination((prev: any) => ({
    ...prev,
    [tab]: { ...prev[tab], page: 1 },
  }));
}

export function handleApiError(error: Error, showNotification: (message: string, type?: 'success' | 'error') => void, defaultMessage: string) {
  showNotification(error.message || defaultMessage, 'error');
}
