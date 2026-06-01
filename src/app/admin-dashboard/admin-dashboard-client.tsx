'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser, useUsers } from '@/hooks/use-auth';
import { useContentTree } from '@/hooks/use-content';
import {
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory,
  useCreateTopic, useUpdateTopic, useDeleteTopic,
  useCreateLetter, useUpdateLetter, useDeleteLetter
} from '@/hooks/use-content';
import {
  logout as logoutService,
  deleteAdminUser,
  createAdminUser,
  updateAdminUser,
} from '@/services/auth-service';
import {
  LogOut, Plus, Search, Shield, Edit2, Trash2, X,
  ChevronRight, TrendingUp, Bell,
  ChevronLeft, ChevronsLeft, ChevronsRight, Eye, EyeOff,
  FileText, Users, Layers, BookOpen, FolderTree
} from 'lucide-react';
import { ADMIN_PAGES, ADMIN_ACCENT_COLORS, getAccentColor } from '@/lib/admin-dashboard-config';

const NAV_ITEMS = ADMIN_PAGES;
const ACCENT = ADMIN_ACCENT_COLORS;

// Pagination Component
function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, accentColor }) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid #e2e8f0',
      background: '#fff',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ fontSize: 13, color: '#64748b' }}>
        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',          
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: currentPage === 1 ? '#f1f5f9' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#94a3b8' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13,
            transition: 'all 0.15s'
          }}
        >
          <ChevronsLeft size={14} /> First
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: currentPage === 1 ? '#f1f5f9' : '#fff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            color: currentPage === 1 ? '#94a3b8' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13
          }}
        >
          <ChevronLeft size={14} /> Prev
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span key={`dots-${index}`} style={{ padding: '8px 4px', color: '#94a3b8' }}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: currentPage === page ? 'none' : '1px solid #e2e8f0',
                background: currentPage === page ? `linear-gradient(135deg, ${accentColor.from}, ${accentColor.to})` : '#fff',
                color: currentPage === page ? '#fff' : '#475569',
                cursor: 'pointer',
                fontWeight: currentPage === page ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.15s'
              }}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: currentPage === totalPages ? '#f1f5f9' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#94a3b8' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13
          }}
        >
          Next <ChevronRight size={14} />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: currentPage === totalPages ? '#f1f5f9' : '#fff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            color: currentPage === totalPages ? '#94a3b8' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 13
          }}
        >
          Last <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard({ defaultTab = 'categories' }) {
  const [activeTab, setActiveTab]   = useState(defaultTab);
  const [showForm, setShowForm]     = useState(false);
  const [formData, setFormData]     = useState({});
  const [formType, setFormType]     = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notification, setNotification] = useState(null);
  
  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Pagination states
  const [pagination, setPagination] = useState({
    categories: { page: 1, itemsPerPage: 10 },
    subcategories: { page: 1, itemsPerPage: 10 },
    topics: { page: 1, itemsPerPage: 10 },
    letters: { page: 1, itemsPerPage: 10 },
    users: { page: 1, itemsPerPage: 10 },
  });
  
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => { setIsClient(true); }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: userData,       isLoading: userLoading,        error: userError }    = useCurrentUser();
  const { data: usersData,      isLoading: usersLoading }      = useUsers();
  const { data: contentTreeData, isLoading: contentTreeLoading, error: contentTreeError } = useContentTree();

  const user         = userData;
  const users        = Array.isArray(usersData) ? usersData : [];
  const categories   = Array.isArray(contentTreeData) ? contentTreeData : [];
  const subcategories = useMemo(() => categories.flatMap((category) => category.subcategories || []), [categories]);
  const topics       = useMemo(() => subcategories.flatMap((subcategory) => subcategory.topics || []), [subcategories]);
  const letters      = useMemo(() => topics.flatMap((topic) => topic.letters || []), [topics]);

  const categoryMap = useMemo(() => new Map(categories.map(c => [String(c._id), c.name])), [categories]);
  const subcategoryMap = useMemo(() => new Map(subcategories.map(s => [String(s._id), s.name])), [subcategories]);
  const topicMap = useMemo(() => new Map(topics.map(t => [String(t._id), t.name])), [topics]);

  const createCategoryMutation    = useCreateCategory();
  const updateCategoryMutation    = useUpdateCategory();
  const deleteCategoryMutation    = useDeleteCategory();
  const createSubcategoryMutation = useCreateSubcategory();
  const updateSubcategoryMutation = useUpdateSubcategory();
  const deleteSubcategoryMutation = useDeleteSubcategory();
  const createTopicMutation       = useCreateTopic();
  const updateTopicMutation       = useUpdateTopic();
  const deleteTopicMutation       = useDeleteTopic();
  const createLetterMutation      = useCreateLetter();
  const updateLetterMutation      = useUpdateLetter();
  const deleteLetterMutation      = useDeleteLetter();

  const checkAdmin = useCallback(() => {
    if (userError) { router.push('/login'); return; }
    if (user && user.role !== 'admin') { router.push('/dashboard'); }
  }, [userError, router, user]);

  useEffect(() => { checkAdmin(); }, [checkAdmin]);

  const handleLogout = async () => {
    try {
      await logoutService();
      localStorage.removeItem('token');
      router.push('/login');
    } catch (e) { console.error(e); }
  };

  const openForm = (type, item = null) => {
    setFormType(type);
    setShowPassword(false);
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item._id,
        name: item.name || '',
        email: item.email || '',
        role: item.role || 'user',
        password: '',
        description: item.description || '',
        slug: item.slug || '',
        category: item.category?._id || item.category?.id || item.category || '',
        subcategory: item.subcategory?._id || item.subcategory?.id || item.subcategory || '',
        topic: item.topic?._id || item.topic?.id || item.topic || '',
        title: item.title || '',
        content: item.content || '',
        letter_type: item.letter_type || '',
        level: item.level || '',
        full_code: item.full_code || '',
      });
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setFormData({}); setFormType(''); setEditingItem(null); setShowPassword(false); };

  const handleDelete = (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return;
    if (type === 'user') {
      deleteAdminUser(id)
        .then(() => {
          showNotification('User deleted successfully');
          queryClient.invalidateQueries(['users']);
        })
        .catch(error => showNotification(error.message || 'Failed to delete user', 'error'));
    } else {
      const map = { category: deleteCategoryMutation, subcategory: deleteSubcategoryMutation, topic: deleteTopicMutation, letter: deleteLetterMutation };
      map[type]?.mutate(id, {
        onSuccess: () => {
          showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
          // Reset to first page after deletion
          setPagination(prev => ({ ...prev, [type === 'letter' ? 'letters' : type + 's']: { ...prev[type === 'letter' ? 'letters' : type + 's'], page: 1 } }));
        },
        onError: (error) => showNotification(error.message || `Failed to delete ${type}`, 'error')
      });
    }
  };

  const handlePageChange = (tab, newPage) => {
    setPagination(prev => ({
      ...prev,
      [tab]: { ...prev[tab], page: newPage }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isClient) return;
    if (formType === 'user') {
      const d = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) d.password = formData.password;
      if (editingItem) {
        updateAdminUser(editingItem._id, d)
          .then(() => { showNotification('User updated successfully'); closeForm(); queryClient.invalidateQueries(['users']); })
          .catch(error => showNotification(error.message || 'Failed to update user', 'error'));
      } else {
        createAdminUser(d)
          .then(() => { showNotification('User created successfully'); closeForm(); queryClient.invalidateQueries(['users']); })
          .catch(error => showNotification(error.message || 'Failed to create user', 'error'));
      }
    } else if (formType === 'category') {
      const d = { name: formData.name, slug: formData.slug, description: formData.description };
      if (editingItem) {
        updateCategoryMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification('Category updated successfully'); closeForm(); setPagination(prev => ({ ...prev, categories: { ...prev.categories, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to update category', 'error')
        });
      } else {
        createCategoryMutation.mutate(d, {
          onSuccess: () => { showNotification('Category created successfully'); closeForm(); setPagination(prev => ({ ...prev, categories: { ...prev.categories, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to create category', 'error')
        });
      }
    } else if (formType === 'subcategory') {
      const d = { name: formData.name, slug: formData.slug, description: formData.description, category: formData.category };
      if (editingItem) {
        updateSubcategoryMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification('Subcategory updated successfully'); closeForm(); setPagination(prev => ({ ...prev, subcategories: { ...prev.subcategories, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to update subcategory', 'error')
        });
      } else {
        createSubcategoryMutation.mutate(d, {
          onSuccess: () => { showNotification('Subcategory created successfully'); closeForm(); setPagination(prev => ({ ...prev, subcategories: { ...prev.subcategories, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to create subcategory', 'error')
        });
      }
    } else if (formType === 'topic') {
      const d = { name: formData.name, slug: formData.slug, description: formData.description, subcategory: formData.subcategory };
      if (editingItem) {
        updateTopicMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification('Topic updated successfully'); closeForm(); setPagination(prev => ({ ...prev, topics: { ...prev.topics, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to update topic', 'error')
        });
      } else {
        createTopicMutation.mutate(d, {
          onSuccess: () => { showNotification('Topic created successfully'); closeForm(); setPagination(prev => ({ ...prev, topics: { ...prev.topics, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to create topic', 'error')
        });
      }
    } else if (formType === 'letter') {
      const d = { title: formData.title, content: formData.content, topic: formData.topic, letter_type: formData.letter_type, level: formData.level, full_code: formData.full_code };
      if (editingItem) {
        updateLetterMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification('Letter updated successfully'); closeForm(); setPagination(prev => ({ ...prev, letters: { ...prev.letters, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to update letter', 'error')
        });
      } else {
        createLetterMutation.mutate(d, {
          onSuccess: () => { showNotification('Letter created successfully'); closeForm(); setPagination(prev => ({ ...prev, letters: { ...prev.letters, page: 1 } })); },
          onError: (error) => showNotification(error.message || 'Failed to create letter', 'error')
        });
      }
    }
  };

  // Filter and paginate data
  const getPaginatedData = (data, tab) => {
    const filtered = data.filter(item => {
      if (tab === 'users') return item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (tab === 'letters') return item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
    
    const { page, itemsPerPage } = pagination[tab];
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    return { items: paginatedItems, totalPages, totalItems: filtered.length };
  };

  const categoriesData_paginated = getPaginatedData(categories, 'categories');
  const subcategoriesData_paginated = getPaginatedData(subcategories, 'subcategories');
  const topicsData_paginated = getPaginatedData(topics, 'topics');
  const lettersData_paginated = getPaginatedData(letters, 'letters');
  const usersData_paginated = getPaginatedData(users, 'users');

  if (!isClient || userLoading || contentTreeLoading) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center" style={{ margin:'0 auto 24px' }}>
          <svg
            className="w-7 h-7 text-sky-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:16, fontFamily:'system-ui' }}>Loading dashboard…</p>
      </div>
    </div>
  );
  if (!user) return null;

  const fetchErrors = [contentTreeError].filter(Boolean);
  const errorMessage = fetchErrors.length ? fetchErrors.map(e=>e?.message || String(e)).join(' • ') : null;

  const accentColor = ACCENT[activeTab] || ACCENT.categories;

  /* ─── FORM MODAL ─── */
  const renderForm = () => {
    if (!showForm) return null;
    const ac = ACCENT[formType] || ACCENT.categories;
    const inputCls = {
      width:'100%', padding:'12px 16px', border:'1.5px solid #e2e8f0',
      borderRadius:12, fontSize:14, fontFamily:'system-ui', outline:'none',
      transition:'border-color 0.2s, box-shadow 0.2s', background:'#fff', color:'#1e293b'
    };
    return (
      <div style={{ position:'fixed', inset:0, background:'rgba(15,12,41,0.75)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
        <div style={{ background:'#fff', borderRadius:24, padding:36, maxWidth:560, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 32px 80px rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.8)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
            <div>
              <div style={{ width:8, height:8, borderRadius:'50%', background:`linear-gradient(135deg,${ac.from},${ac.to})`, display:'inline-block', marginRight:10, verticalAlign:'middle' }} />
              <span style={{ fontSize:20, fontWeight:700, color:'#0f172a', fontFamily:'system-ui' }}>
                {editingItem ? `Edit ${formType}` : `New ${formType}`}
              </span>
            </div>
            <button onClick={closeForm} style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={16} color="#64748b" />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {formType === 'user' && (
              <>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Name *</label>
                  <input type="text" placeholder="Enter user name" value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} required style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Email *</label>
                  <input type="email" placeholder="Enter email address" value={formData.email||''} onChange={e=>setFormData({...formData,email:e.target.value})} required style={inputCls} />
                </div>
                <div style={{ position:'relative' }}>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>{editingItem ? 'New Password (optional)' : 'Password *'}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={editingItem ? 'Leave blank to keep current password' : 'Enter password'}
                    value={formData.password||''}
                    onChange={e=>setFormData({...formData,password:e.target.value})}
                    required={!editingItem}
                    style={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    style={{
                      position:'absolute',
                      right:12,
                      top:40,
                      border:'none',
                      background:'transparent',
                      color:'#475569',
                      fontSize:13,
                      cursor:'pointer',
                      padding:'0 6px'
                    }}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  {editingItem && (
                    <p style={{ margin: '8px 0 0', color:'#64748b', fontSize:12 }}>
                      Current password is hidden for security. Enter a new password only if you want to change it.
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Role *</label>
                  <select value={formData.role||'user'} onChange={e=>setFormData({...formData,role:e.target.value})} required style={{...inputCls,cursor:'pointer'}}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}
            {formType === 'subcategory' && (
              <>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Category *</label>
                  <select value={formData.category||''} onChange={e=>setFormData({...formData,category:e.target.value})} required style={{...inputCls,cursor:'pointer'}}>
                    <option value="">Choose a category…</option>
                    {categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Name *</label>
                  <input type="text" placeholder="Enter subcategory name" value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} required style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Slug</label>
                  <input type="text" placeholder="URL-friendly identifier (optional)" value={formData.slug||''} onChange={e=>setFormData({...formData,slug:e.target.value})} style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Description</label>
                  <textarea placeholder="Optional description…" value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3} style={{...inputCls,resize:'vertical'}} />
                </div>
              </>
            )}
            {formType === 'topic' && (
              <>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Subcategory *</label>
                  <select value={formData.subcategory||''} onChange={e=>setFormData({...formData,subcategory:e.target.value})} required style={{...inputCls,cursor:'pointer'}}>
                    <option value="">Choose a subcategory…</option>
                    {subcategories.map(s=><option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Name *</label>
                  <input type="text" placeholder="Enter topic name" value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} required style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Slug</label>
                  <input type="text" placeholder="URL-friendly identifier (optional)" value={formData.slug||''} onChange={e=>setFormData({...formData,slug:e.target.value})} style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Description</label>
                  <textarea placeholder="Optional description…" value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3} style={{...inputCls,resize:'vertical'}} />
                </div>
              </>
            )}
            {formType === 'letter' && (
              <>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Topic *</label>
                  <select value={formData.topic||''} onChange={e=>setFormData({...formData,topic:e.target.value})} required style={{...inputCls,cursor:'pointer'}}>
                    <option value="">Choose a topic…</option>
                    {topics.map(t=><option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Title *</label>
                  <input type="text" placeholder="Enter letter title" value={formData.title||''} onChange={e=>setFormData({...formData,title:e.target.value})} required style={inputCls} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Letter Type</label>
                    <input type="text" placeholder="e.g., A, B, C" value={formData.letter_type||''} onChange={e=>setFormData({...formData,letter_type:e.target.value})} style={inputCls} />
                  </div>
                  <div>
                    <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Level</label>
                    <input type="text" placeholder="e.g., a, b, c" value={formData.level||''} onChange={e=>setFormData({...formData,level:e.target.value})} style={inputCls} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Full Code</label>
                  <input type="text" placeholder="e.g., A_a" value={formData.full_code||''} onChange={e=>setFormData({...formData,full_code:e.target.value})} style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Content *</label>
                  <textarea placeholder="Write the letter content…" value={formData.content||''} onChange={e=>setFormData({...formData,content:e.target.value})} required rows={6} style={{...inputCls,resize:'vertical',lineHeight:1.6}} />
                </div>
              </>
            )}
            {(formType !== 'letter' && formType !== 'user' && formType !== 'subcategory' && formType !== 'topic') && (
              <>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Name *</label>
                  <input type="text" placeholder={`Enter ${formType} name`} value={formData.name||''} onChange={e=>setFormData({...formData,name:e.target.value})} required style={inputCls} />
                </div>
                <div>
                  <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Slug</label>
                  <input type="text" placeholder="URL-friendly identifier (optional)" value={formData.slug||''} onChange={e=>setFormData({...formData,slug:e.target.value})} style={inputCls} />
                </div>
              </>
            )}
            {(formType !== 'letter' && formType !== 'user' && formType !== 'subcategory' && formType !== 'topic') && (
              <div>
                <label style={{ fontSize:13, fontWeight:600, color:'#475569', display:'block', marginBottom:8 }}>Description</label>
                <textarea placeholder="Optional description…" value={formData.description||''} onChange={e=>setFormData({...formData,description:e.target.value})} rows={3} style={{...inputCls,resize:'vertical'}} />
              </div>
            )}
            <div style={{ display:'flex', gap:12, paddingTop:8 }}>
              <button type="submit" style={{ flex:1, padding:'13px 20px', background:`linear-gradient(135deg,${ac.from},${ac.to})`, color:'#fff', border:'none', borderRadius:12, fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'system-ui', letterSpacing:0.3, boxShadow:`0 8px 24px ${ac.from}40` }}>
                {editingItem ? 'Save Changes' : 'Create'}
              </button>
              <button type="button" onClick={closeForm} style={{ flex:1, padding:'13px 20px', background:'#f1f5f9', color:'#64748b', border:'none', borderRadius:12, fontSize:15, fontWeight:600, cursor:'pointer', fontFamily:'system-ui' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  /* ─── TABLE HELPER ─── */
  const Table = ({ cols, rows, loading, icon: Icon, empty, tabName }) => (
    <div style={{ background:'#fff', borderRadius:20, border:'1px solid #e2e8f0', overflow:'hidden', boxShadow:'0 4px 24px rgba(15,23,42,0.06)' }}>
      {loading ? (
        <div style={{ padding:48, textAlign:'center' }}>
          <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTop:`3px solid ${accentColor.from}`, borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }} />
          <p style={{ color:'#94a3b8', fontFamily:'system-ui', fontSize:14 }}>Loading…</p>
        </div>
      ) : rows.length === 0 ? (
        <div style={{ padding:64, textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:20, background:accentColor.light, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <Icon size={28} color={accentColor.from} />
          </div>
          <p style={{ color:'#94a3b8', fontFamily:'system-ui', fontSize:15, fontWeight:500 }}>{empty}</p>
        </div>
      ) : (
        <>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                  {cols.map(c=>(
                    <th key={c} style={{ padding:'14px 20px', textAlign:'left', fontSize:11, fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'system-ui', whiteSpace:'nowrap' }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
          <Pagination 
            currentPage={pagination[tabName].page}
            totalPages={Math.ceil(getPaginatedData(tabName === 'users' ? users : tabName === 'letters' ? letters : tabName === 'categories' ? categories : tabName === 'subcategories' ? subcategories : topics, tabName).totalPages)}
            onPageChange={(page) => handlePageChange(tabName, page)}
            totalItems={getPaginatedData(tabName === 'users' ? users : tabName === 'letters' ? letters : tabName === 'categories' ? categories : tabName === 'subcategories' ? subcategories : topics, tabName).totalItems}
            itemsPerPage={pagination[tabName].itemsPerPage}
            accentColor={ACCENT[tabName] || ACCENT.categories}
          />
        </>
      )}
    </div>
  );

  const tdStyle = { padding:'16px 20px', borderBottom:'1px solid #f1f5f9', fontSize:14, color:'#334155', fontFamily:'system-ui', verticalAlign:'middle' };
  const avatarStyle = (from, to) => ({ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${from},${to})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 });
  const badgeStyle = (bg, text) => ({ display:'inline-flex', padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:600, background:bg, color:text });
  const actionBtnStyle = (hoverBg) => ({ padding:8, borderRadius:10, border:'none', background:'transparent', cursor:'pointer', display:'inline-flex', alignItems:'center', justifyContent:'center', transition:'background 0.15s' });

  /* ─── STATS DATA ─── */
  const stats = [
    { label:'Total Users',   value: users.length,       icon: Users,      from:'#818cf8', to:'#6366f1', light:'#eef2ff', text:'#4338ca' },
    { label:'Total Letters', value: letters.length,     icon: FileText,   from:'#34d399', to:'#10b981', light:'#ecfdf5', text:'#047857' },
    { label:'Categories',    value: categories.length,  icon: Layers,     from:'#60a5fa', to:'#3b82f6', light:'#eff6ff', text:'#1d4ed8' },
    { label:'Topics',        value: topics.length,      icon: BookOpen,   from:'#fb923c', to:'#f97316', light:'#fff7ed', text:'#c2410c' },
  ];

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}}
        .nav-btn:hover{background:rgba(255,255,255,0.07)!important}
        .action-btn-edit:hover{background:#eff6ff!important}
        .action-btn-del:hover{background:#fef2f2!important}
        .stat-card{transition:transform 0.2s,box-shadow 0.2s}
        .stat-card:hover{transform:translateY(-3px);box-shadow:0 16px 48px rgba(15,23,42,0.12)!important}
        .letter-card{transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s}
        .letter-card:hover{transform:translateY(-2px);box-shadow:0 12px 36px rgba(245,158,11,0.15)!important;border-color:#fcd34d!important}
        input:focus,select:focus,textarea:focus{border-color:${accentColor.from}!important;box-shadow:0 0 0 4px ${accentColor.ring}80!important}
      `}</style>
      {notification && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:2000, animation:'slideIn 0.3s ease' }}>
          <div style={{
            padding:'14px 20px',
            borderRadius:12,
            background:notification.type === 'error' ? '#fef2f2' : '#ecfdf5',
            border:`1.5px solid ${notification.type === 'error' ? '#fecaca' : '#a7f3d0'}`,
            color:notification.type === 'error' ? '#dc2626' : '#059669',
            fontSize:14,
            fontWeight:600,
            boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
            display:'flex',
            alignItems:'center',
            gap:10
          }}>
            {notification.type === 'error' ? '⚠️' : '✓'} {notification.message}
          </div>
        </div>
      )}
      {renderForm()}

      <div style={{ minHeight:'100vh', display:'flex', fontFamily:'system-ui,-apple-system,sans-serif', background:'#f8fafc' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width:260, background:'linear-gradient(180deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)', display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh', flexShrink:0, borderRight:'1px solid rgba(255,255,255,0.05)' }}>
          {/* Logo */}
          <div style={{ padding:'28px 24px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:44, height:44, borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px #6366f160' }}>
                <svg
                  width="22"
                  height="22"
                  fill="#60a5fa"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <div style={{ color:'#fff', fontWeight:800, fontSize:16, letterSpacing:'-0.02em' }}>Admin Panel</div>
                <div style={{ color:'#818cf8', fontSize:12, fontWeight:500, marginTop:1 }}>Words to Wellness</div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div style={{ padding:'16px 16px 8px' }}>
            <div style={{ position:'relative' }}>
              <Search size={14} color="#818cf8" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search content…"
                value={searchQuery}
                onChange={e=>{setSearchQuery(e.target.value); setPagination(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], page: 1 } }));}}
                style={{ width:'100%', padding:'10px 12px 10px 34px', background:'rgba(255,255,255,0.12)', border:'1.5px solid rgba(129,140,248,0.3)', borderRadius:12, color:'#fff', fontSize:13, outline:'none', boxSizing:'border-box', transition:'border-color 0.2s, background 0.2s' }}
                onFocus={e=>e.target.style.borderColor='rgba(129,140,248,0.6)'}
                onBlur={e=>e.target.style.borderColor='rgba(129,140,248,0.3)'}
              />
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:'8px 12px', display:'flex', flexDirection:'column', gap:2 }}>
            <div style={{ padding:'8px 12px 6px', fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Navigation</div>
            {NAV_ITEMS.map(item => {
              const active = activeTab === item.id;
              const ac = ACCENT[item.id] || ACCENT.categories;
              return (
                <button key={item.id} className="nav-btn" onClick={() => { router.push(`/admin-dashboard/${item.id}`); setSearchQuery(''); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:12, border:'none', cursor:'pointer', background: active ? `linear-gradient(135deg,${ac.from}22,${ac.to}22)` : 'transparent', transition:'background 0.15s', textAlign:'left', borderLeft: active ? `3px solid ${ac.from}` : '3px solid transparent' }}>
                  <item.icon size={18} color={active ? ac.from : 'rgba(255,255,255,0.4)'} />
                  <span style={{ fontSize:14, fontWeight: active ? 700 : 500, color: active ? '#f1f5f9' : 'rgba(255,255,255,0.5)', flex:1 }}>{item.label}</span>
                  {active && <ChevronRight size={14} color={ac.from} />}
                </button>
              );
            })}
          </nav>

          {/* User + Logout */}
          <div style={{ padding:'16px 12px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(255,255,255,0.04)', borderRadius:12, marginBottom:8 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#818cf8,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div style={{ overflow:'hidden', flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</div>
                <div style={{ fontSize:11, color:'#818cf8', fontWeight:500 }}>Administrator</div>
              </div>
            </div>
            <button onClick={handleLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:12, border:'none', background:'rgba(239,68,68,0.1)', cursor:'pointer', color:'#f87171', fontSize:14, fontWeight:600, transition:'background 0.15s' }}>
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Topbar */}
          <header style={{ background:'rgba(255,255,255,0.9)', backdropFilter:'blur(16px)', borderBottom:'1px solid #e2e8f0', padding:'0 32px', height:68, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <div style={{ padding:'6px 16px', borderRadius:20, background:`linear-gradient(135deg,${accentColor.from},${accentColor.to})`, color:'#fff', fontSize:13, fontWeight:700, boxShadow:`0 4px 12px ${accentColor.from}50`, display:'flex', alignItems:'center', gap:6 }}>
                <Shield size={14} />
                Admin
              </div>
              <span style={{ color:'#94a3b8', fontSize:13 }}>
                {NAV_ITEMS.find(n=>n.id===activeTab)?.label}
              </span>
            </div>
            
          </header>

          {/* Content */}
          <div style={{ flex:1, padding:'32px', overflowY:'auto', animation:'fadeIn 0.3s ease' }}>
            {errorMessage && (
              <div style={{ maxWidth:1100, margin:'0 auto 20px', padding:'16px 20px', borderRadius:18, background:'#fef2f2', border:'1px solid #fecaca', color:'#b91c1c', fontSize:14, fontWeight:600 }}>
                Content fetch error: {errorMessage}
              </div>
            )}
            <div style={{ maxWidth:1100, margin:'0 auto' }}>

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ marginBottom:32 }}>
                    <h1 style={{ fontSize:28, fontWeight:800, color:'#0f172a', margin:0, letterSpacing:'-0.03em' }}>
                      Good morning 👋
                    </h1>
                    <p style={{ color:'#94a3b8', marginTop:6, fontSize:15 }}>Here's what's happening on your platform today.</p>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:20, marginBottom:32 }}>
                    {stats.map((s, i) => (
                      <div key={i} className="stat-card" style={{ background:'#fff', borderRadius:20, padding:'24px', border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(15,23,42,0.06)', display:'flex', flexDirection:'column', gap:16 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                          <div style={{ width:48, height:48, borderRadius:16, background:`linear-gradient(135deg,${s.from},${s.to})`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 20px ${s.from}40` }}>
                            <s.icon size={22} color="#fff" />
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:20, background:s.light, color:s.text, fontSize:12, fontWeight:700 }}>
                            <TrendingUp size={12} />
                            +12%
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize:36, fontWeight:800, color:'#0f172a', lineHeight:1, letterSpacing:'-0.04em' }}>{s.value}</div>
                          <div style={{ fontSize:14, color:'#64748b', fontWeight:500, marginTop:4 }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
                    <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(15,23,42,0.06)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                        <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:0 }}>Content Breakdown</h2>
                      </div>
                      {[
                        { label:'Categories', value:categories.length, max: Math.max(categories.length,1), color:'#6366f1' },
                        { label:'Subcategories', value:subcategories.length, max: Math.max(subcategories.length,1), color:'#10b981' },
                        { label:'Topics', value:topics.length, max: Math.max(topics.length,1), color:'#0ea5e9' },
                        { label:'Letters', value:letters.length, max: Math.max(letters.length,1), color:'#f59e0b' },
                      ].map((item, i) => {
                        const total = categories.length + subcategories.length + topics.length + letters.length || 1;
                        const pct = Math.round((item.value / total) * 100);
                        return (
                          <div key={i} style={{ marginBottom:16 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, fontWeight:600, color:'#475569', marginBottom:8 }}>
                              <span>{item.label}</span>
                              <span style={{ color:item.color }}>{item.value}</span>
                            </div>
                            <div style={{ height:8, background:'#f1f5f9', borderRadius:4, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${item.color}cc,${item.color})`, borderRadius:4, transition:'width 1s ease' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ background:'#fff', borderRadius:20, padding:28, border:'1px solid #e2e8f0', boxShadow:'0 4px 24px rgba(15,23,42,0.06)' }}>
                      <h2 style={{ fontSize:16, fontWeight:700, color:'#0f172a', margin:'0 0 20px' }}>Quick Actions</h2>
                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                        {[
                          { label:'Add User', type:'user', ...ACCENT.users },
                          { label:'Add Category', type:'category', ...ACCENT.categories },
                          { label:'Add Subcategory', type:'subcategory', ...ACCENT.subcategories },
                          { label:'Add Topic', type:'topic', ...ACCENT.topics },
                          { label:'Add Letter', type:'letter', ...ACCENT.letters },
                        ].map((a, i) => (
                          <button key={i} onClick={()=>openForm(a.type)} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:14, border:`1.5px dashed ${a.ring}`, background:a.light, cursor:'pointer', transition:'all 0.15s', textAlign:'left' }}>
                            <div style={{ width:34, height:34, borderRadius:10, background:`linear-gradient(135deg,${a.from},${a.to})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:`0 4px 12px ${a.from}40` }}>
                              <Plus size={16} color="#fff" />
                            </div>
                            <span style={{ fontSize:14, fontWeight:700, color:a.text }}>{a.label}</span>
                            <ChevronRight size={16} color={a.from} style={{ marginLeft:'auto' }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── USERS ── */}
              {activeTab === 'users' && (
                <div style={{ animation:'fadeIn 0.3s ease' }}>
                  <PageHeader title="Users" subtitle="Manage user accounts and permissions" count={usersData_paginated.totalItems}
                    action={<AddBtn label="User" onClick={()=>openForm('user')} ac={ACCENT.users} />}
                  />
                  <Table
                    cols={['User', 'Email', 'Role', 'Joined', 'Actions']}
                    icon={Users} empty="No users found" loading={usersLoading} tabName="users"
                    rows={usersData_paginated.items.map(u=>(
                      <tr key={u._id} style={{ transition:'background 0.1s' }} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ ...avatarStyle('#ec4899','#a855f7') }}>
                              <span style={{ color:'#fff', fontSize:15, fontWeight:700 }}>{u.name?.charAt(0).toUpperCase()||'U'}</span>
                            </div>
                            <span style={{ fontWeight:600, color:'#0f172a' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}><span style={{ color:'#64748b' }}>{u.email}</span></td>
                        <td style={tdStyle}>
                          <span style={badgeStyle(u.role==='admin'?'#ede9fe':'#eff6ff', u.role==='admin'?'#7c3aed':'#1d4ed8')}>{u.role}</span>
                        </td>
                        <td style={{...tdStyle, color:'#94a3b8'}}>{new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="action-btn-edit" onClick={()=>openForm('user',u)} style={actionBtnStyle('#eff6ff')}><Edit2 size={15} color="#3b82f6" /></button>
                            <button className="action-btn-del" onClick={()=>handleDelete('user',u._id)} style={actionBtnStyle('#fef2f2')}><Trash2 size={15} color="#ef4444" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {/* ── CATEGORIES ── */}
              {activeTab === 'categories' && (
                <div style={{ animation:'fadeIn 0.3s ease' }}>
                  <PageHeader title="Categories" subtitle="Manage content categories" count={categoriesData_paginated.totalItems}
                    action={<AddBtn label="Category" onClick={()=>openForm('category')} ac={ACCENT.categories} />}
                  />
                  <Table
                    cols={['Category','Description','Created','Actions']}
                    icon={Layers} empty="No categories yet. Add a category to see it here." loading={contentTreeLoading} tabName="categories"
                    rows={categoriesData_paginated.items.map(cat=>(
                      <tr key={cat._id} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={avatarStyle(ACCENT.categories.from, ACCENT.categories.to)}><Layers size={16} color="#fff" /></div>
                            <span style={{ fontWeight:600, color:'#0f172a' }}>{cat.name}</span>
                          </div>
                        </td>
                        <td style={{...tdStyle, maxWidth:220}}><span style={{ color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{cat.description||'—'}</span></td>
                        <td style={{...tdStyle, color:'#94a3b8', whiteSpace:'nowrap'}}>{new Date(cat.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="action-btn-edit" onClick={()=>openForm('category',cat)} style={{...actionBtnStyle('#eff6ff')}} title="Edit"><Edit2 size={15} color="#3b82f6" /></button>
                            <button className="action-btn-del" onClick={()=>handleDelete('category',cat._id)} style={{...actionBtnStyle('#fef2f2')}} title="Delete"><Trash2 size={15} color="#ef4444" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {/* ── SUBCATEGORIES ── */}
              {activeTab === 'subcategories' && (
                <div style={{ animation:'fadeIn 0.3s ease' }}>
                  <PageHeader title="Subcategories" subtitle="Manage content subcategories" count={subcategoriesData_paginated.totalItems}
                    action={<AddBtn label="Subcategory" onClick={()=>openForm('subcategory')} ac={ACCENT.subcategories} />}
                  />
                  <Table
                    cols={['Subcategory','Category','Description','Created','Actions']}
                    icon={FolderTree} empty="No subcategories yet" loading={contentTreeLoading} tabName="subcategories"
                    rows={subcategoriesData_paginated.items.map(sub=>(
                      <tr key={sub._id} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={avatarStyle(ACCENT.subcategories.from, ACCENT.subcategories.to)}><FolderTree size={16} color="#fff" /></div>
                            <span style={{ fontWeight:600, color:'#0f172a' }}>{sub.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}><span style={badgeStyle(ACCENT.subcategories.light, ACCENT.subcategories.text)}>{typeof sub.category === 'string' ? categoryMap.get(sub.category) || '—' : sub.category?.name || '—'}</span></td>
                        <td style={{...tdStyle, maxWidth:200}}><span style={{ color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{sub.description||'—'}</span></td>
                        <td style={{...tdStyle, color:'#94a3b8', whiteSpace:'nowrap'}}>{new Date(sub.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="action-btn-edit" onClick={()=>openForm('subcategory',sub)} style={actionBtnStyle('#eff6ff')}><Edit2 size={15} color="#3b82f6" /></button>
                            <button className="action-btn-del" onClick={()=>handleDelete('subcategory',sub._id)} style={actionBtnStyle('#fef2f2')}><Trash2 size={15} color="#ef4444" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {/* ── TOPICS ── */}
              {activeTab === 'topics' && (
                <div style={{ animation:'fadeIn 0.3s ease' }}>
                  <PageHeader title="Topics" subtitle="Manage content topics" count={topicsData_paginated.totalItems}
                    action={<AddBtn label="Topic" onClick={()=>openForm('topic')} ac={ACCENT.topics} />}
                  />
                  <Table
                    cols={['Topic','Subcategory','Description','Created','Actions']}
                    icon={BookOpen} empty="No topics yet" loading={contentTreeLoading} tabName="topics"
                    rows={topicsData_paginated.items.map(topic=>(
                      <tr key={topic._id} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={avatarStyle(ACCENT.topics.from, ACCENT.topics.to)}><BookOpen size={16} color="#fff" /></div>
                            <span style={{ fontWeight:600, color:'#0f172a' }}>{topic.name}</span>
                          </div>
                        </td>
                        <td style={tdStyle}><span style={badgeStyle(ACCENT.topics.light, ACCENT.topics.text)}>{typeof topic.subcategory === 'string' ? subcategoryMap.get(topic.subcategory) || '—' : topic.subcategory?.name || '—'}</span></td>
                        <td style={{...tdStyle, maxWidth:200}}><span style={{ color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{topic.description||'—'}</span></td>
                        <td style={{...tdStyle, color:'#94a3b8', whiteSpace:'nowrap'}}>{new Date(topic.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="action-btn-edit" onClick={()=>openForm('topic',topic)} style={actionBtnStyle('#eff6ff')}><Edit2 size={15} color="#3b82f6" /></button>
                            <button className="action-btn-del" onClick={()=>handleDelete('topic',topic._id)} style={actionBtnStyle('#fef2f2')}><Trash2 size={15} color="#ef4444" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {/* ── LETTERS ── */}
              {activeTab === 'letters' && (
                <div style={{ animation:'fadeIn 0.3s ease' }}>
                  <PageHeader title="Letters" subtitle="Manage all wellness letters" count={lettersData_paginated.totalItems}
                    action={<AddBtn label="Letter" onClick={()=>openForm('letter')} ac={ACCENT.letters} />}
                  />
                  <Table
                    cols={['Letter','Topic','Type','Content Preview','Created','Actions']}
                    icon={FileText} empty="No letters yet" loading={contentTreeLoading} tabName="letters"
                    rows={lettersData_paginated.items.map(letter=>(
                      <tr key={letter._id} onMouseEnter={e=>e.currentTarget.style.background='#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={avatarStyle(ACCENT.letters.from, ACCENT.letters.to)}><FileText size={16} color="#fff" /></div>
                            <span style={{ fontWeight:600, color:'#0f172a' }}>{letter.title}</span>
                          </div>
                        </td>
                        <td style={tdStyle}><span style={badgeStyle(ACCENT.letters.light, ACCENT.letters.text)}>{typeof letter.topic === 'string' ? topicMap.get(String(letter.topic)) || '—' : letter.topic?.name || '—'}</span></td>
                        <td style={tdStyle}><span style={{ color:'#334155', fontWeight:600 }}>{letter.letter_type || '—'}</span></td>
                        <td style={{...tdStyle, maxWidth:250}}><span style={{ color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>{letter.content||'—'}</span></td>
                        <td style={{...tdStyle, color:'#94a3b8', whiteSpace:'nowrap'}}>{new Date(letter.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                        <td style={tdStyle}>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="action-btn-edit" onClick={()=>openForm('letter',letter)} style={actionBtnStyle('#eff6ff')}><Edit2 size={15} color="#3b82f6" /></button>
                            <button className="action-btn-del" onClick={()=>handleDelete('letter',letter._id)} style={actionBtnStyle('#fef2f2')}><Trash2 size={15} color="#ef4444" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </>
  );
}

/* ─── SUB-COMPONENTS ─── */
function PageHeader({ title, subtitle, count, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:24 }}>
      <div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#0f172a', margin:'0 0 4px', letterSpacing:'-0.03em' }}>
          {title}
          <span style={{ fontSize:15, fontWeight:600, color:'#94a3b8', marginLeft:10 }}>({count})</span>
        </h1>
        <p style={{ color:'#94a3b8', margin:0, fontSize:14 }}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function AddBtn({ label, onClick, ac }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:8, padding:'11px 20px', borderRadius:14, border:'none', background:`linear-gradient(135deg,${ac.from},${ac.to})`, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:`0 6px 20px ${ac.from}50`, transition:'transform 0.15s,box-shadow 0.15s', whiteSpace:'nowrap' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.03)';e.currentTarget.style.boxShadow=`0 10px 28px ${ac.from}60`}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=`0 6px 20px ${ac.from}50`}}
    >
      <Plus size={16} />
      Add {label}
    </button>
  );
}
