'use client';
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useUsers } from "@/hooks/use-auth";
import { useContentTree } from "@/hooks/use-content";
import {
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateSubcategory, useUpdateSubcategory, useDeleteSubcategory,
  useCreateTopic, useUpdateTopic, useDeleteTopic,
  useCreateLetter, useUpdateLetter, useDeleteLetter,
} from "@/hooks/use-content";
import {
  logout as logoutService,
  deleteAdminUser,
  createAdminUser,
  updateAdminUser,
} from "@/services/auth-service";
import {
  LogOut, Plus, Search, Shield, Edit2, Trash2, X,
  ChevronRight, TrendingUp, ChevronLeft, ChevronsLeft,
  ChevronsRight, FileText, Users, Layers,
  BookOpen, FolderTree,
} from "lucide-react";
import {
  ADMIN_PAGES,
  ADMIN_ACCENT_COLORS,
} from "@/lib/admin-dashboard-config";
import {
  ADMIN_LAYOUT,
  ADMIN_HEADER,
  ADMIN_SIDEBAR,
  ADMIN_PAGINATION,
  ADMIN_FORM,
  ADMIN_MODAL,
  ADMIN_TABLE,
  ADMIN_AVATARS,
  ADMIN_BADGES,
  ADMIN_BUTTONS,
  ADMIN_LOADING,
  ADMIN_NOTIFICATION,
  ADMIN_CONTENT,
  ADMIN_INDICATOR,
  ADMIN_PASSWORD,
  ADMIN_SEARCH,
  ADMIN_NAV,
  ADMIN_USER,
  ADMIN_ERROR,
  ADMIN_TEXT,
  ADMIN_CONTAINERS,
  ADMIN_STATS,
  ADMIN_WELCOME,
  ADMIN_CONTENT_BREAKDOWN,
  ADMIN_QUICK_ACTIONS,
  ADMIN_PAGE_HEADER,
  ADMIN_ADD_BUTTON,
} from "@/styles";

const NAV_ITEMS = ADMIN_PAGES;
const ACCENT = ADMIN_ACCENT_COLORS;

function formatDate(value) {
  if (!value) return "N/A";
  let d = new Date(value);
  if (isNaN(d.getTime())) {
    const alt = String(value).replace(" ", "T");
    d = new Date(alt);
    if (isNaN(d.getTime())) return "N/A";
  }
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={ADMIN_PAGINATION.container}>
      <div className={ADMIN_PAGINATION.info}>
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
      </div>
      <div className={ADMIN_PAGINATION.buttonGroup}>
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className={ADMIN_PAGINATION.buttonBase(currentPage === 1)}>
          <ChevronsLeft size={14} /> First
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={ADMIN_PAGINATION.buttonBase(currentPage === 1)}>
          <ChevronLeft size={14} /> Prev
        </button>
        {getPageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className={ADMIN_PAGINATION.ellipsis}>...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(Number(page))}
              className={ADMIN_PAGINATION.pageButton(currentPage === page, accentColor.from, accentColor.to)}
            >
              {page}
            </button>
          )
        )}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className={ADMIN_PAGINATION.buttonBase(currentPage === totalPages)}>
          Next <ChevronRight size={14} />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className={ADMIN_PAGINATION.buttonBase(currentPage === totalPages)}>
          Last <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}

// PageHeader Component
function PageHeader({ title, subtitle, count, action }) {
  return (
    <div className={ADMIN_PAGE_HEADER.container}>
      <div>
        <h1 className={ADMIN_PAGE_HEADER.title}>
          {title}
          <span className={ADMIN_PAGE_HEADER.count}>({count})</span>
        </h1>
        <p className={ADMIN_PAGE_HEADER.subtitle}>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

// AddBtn Component
function AddBtn({ label, onClick, ac }) {
  return (
    <button onClick={onClick} className={ADMIN_ADD_BUTTON.button(ac.from, ac.to)}>
      <Plus size={16} className={ADMIN_ADD_BUTTON.icon} />
      Add {label}
    </button>
  );
}

export default function AdminDashboard({ defaultTab = "dashboard" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formType, setFormType] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const [pagination, setPagination] = useState({
    categories: { page: 1, itemsPerPage: 10 },
    subcategories: { page: 1, itemsPerPage: 10 },
    topics: { page: 1, itemsPerPage: 10 },
    letters: { page: 1, itemsPerPage: 10 },
    users: { page: 1, itemsPerPage: 10 },
  });

  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: contentTreeData, isLoading: contentTreeLoading, error: contentTreeError } = useContentTree();

  const user = userData;
  const users = Array.isArray(usersData) ? usersData : [];
  const categories = Array.isArray(contentTreeData) ? contentTreeData : [];
  const subcategories = useMemo(() => categories.flatMap((category) => category.subcategories || []), [categories]);
  const topics = useMemo(() => subcategories.flatMap((subcategory) => subcategory.topics || []), [subcategories]);
  const letters = useMemo(() => topics.flatMap((topic) => topic.letters || []), [topics]);

  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createSubcategoryMutation = useCreateSubcategory();
  const updateSubcategoryMutation = useUpdateSubcategory();
  const deleteSubcategoryMutation = useDeleteSubcategory();
  const createTopicMutation = useCreateTopic();
  const updateTopicMutation = useUpdateTopic();
  const deleteTopicMutation = useDeleteTopic();
  const createLetterMutation = useCreateLetter();
  const updateLetterMutation = useUpdateLetter();
  const deleteLetterMutation = useDeleteLetter();

  const checkAdmin = useCallback(() => {
    if (userError) {
      router.push("/login");
      return;
    }
    if (user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [userError, router, user]);

  useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const handleLogout = async () => {
    try {
      await logoutService();
      localStorage.removeItem("token");
      router.push("/login");
    } catch (e) {
      console.error(e);
    }
  };

  const openForm = (type, item = null) => {
    setFormType(type);
    setShowPassword(false);
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item._id,
        name: item.name || "",
        email: item.email || "",
        role: item.role || "user",
        password: "",
        description: item.description || "",
        slug: item.slug || "",
        category: item.category?._id || item.category?.id || item.category || "",
        subcategory: item.subcategory?._id || item.subcategory?.id || item.subcategory || "",
        topic: item.topic?._id || item.topic?.id || item.topic || "",
        title: item.title || "",
        content: item.content || "",
        letter_type: item.letter_type || "",
        level: item.level || "",
        full_code: item.full_code || "",
      });
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({});
    setFormType("");
    setEditingItem(null);
    setShowPassword(false);
  };

  const handleDelete = (type, id) => {
    if (!confirm(`Delete this ${type}?`)) return;
    if (type === "user") {
      deleteAdminUser(id)
        .then(() => {
          showNotification("User deleted successfully");
          queryClient.invalidateQueries(["users"]);
        })
        .catch((error) => showNotification(error.message || "Failed to delete user", "error"));
    } else {
      const map = {
        category: deleteCategoryMutation,
        subcategory: deleteSubcategoryMutation,
        topic: deleteTopicMutation,
        letter: deleteLetterMutation,
      };
      map[type]?.mutate(id, {
        onSuccess: () => {
          showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
          setPagination((prev) => ({
            ...prev,
            [type === "letter" ? "letters" : type + "s"]: { ...prev[type === "letter" ? "letters" : type + "s"], page: 1 },
          }));
        },
        onError: (error) => showNotification(error.message || `Failed to delete ${type}`, "error"),
      });
    }
  };

  const handlePageChange = (tab, newPage) => {
    setPagination((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], page: newPage },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isClient) return;

    if (formType === "user") {
      const d = { name: formData.name, email: formData.email, role: formData.role };
      if (formData.password) d.password = formData.password;
      if (editingItem) {
        updateAdminUser(editingItem._id, d)
          .then(() => { showNotification("User updated successfully"); closeForm(); queryClient.invalidateQueries(["users"]); })
          .catch((error) => showNotification(error.message || "Failed to update user", "error"));
      } else {
        createAdminUser(d)
          .then(() => { showNotification("User created successfully"); closeForm(); queryClient.invalidateQueries(["users"]); })
          .catch((error) => showNotification(error.message || "Failed to create user", "error"));
      }
    } else if (formType === "category") {
      const d = { name: formData.name, slug: formData.slug, description: formData.description };
      if (editingItem) {
        updateCategoryMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification("Category updated successfully"); closeForm(); setPagination((prev) => ({ ...prev, categories: { ...prev.categories, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to update category", "error"),
        });
      } else {
        createCategoryMutation.mutate(d, {
          onSuccess: () => { showNotification("Category created successfully"); closeForm(); setPagination((prev) => ({ ...prev, categories: { ...prev.categories, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to create category", "error"),
        });
      }
    } else if (formType === "subcategory") {
      const d = { name: formData.name, slug: formData.slug, description: formData.description, category: formData.category };
      if (editingItem) {
        updateSubcategoryMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification("Subcategory updated successfully"); closeForm(); setPagination((prev) => ({ ...prev, subcategories: { ...prev.subcategories, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to update subcategory", "error"),
        });
      } else {
        createSubcategoryMutation.mutate(d, {
          onSuccess: () => { showNotification("Subcategory created successfully"); closeForm(); setPagination((prev) => ({ ...prev, subcategories: { ...prev.subcategories, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to create subcategory", "error"),
        });
      }
    } else if (formType === "topic") {
      const d = { name: formData.name, slug: formData.slug, description: formData.description, subcategory: formData.subcategory };
      if (editingItem) {
        updateTopicMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification("Topic updated successfully"); closeForm(); setPagination((prev) => ({ ...prev, topics: { ...prev.topics, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to update topic", "error"),
        });
      } else {
        createTopicMutation.mutate(d, {
          onSuccess: () => { showNotification("Topic created successfully"); closeForm(); setPagination((prev) => ({ ...prev, topics: { ...prev.topics, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to create topic", "error"),
        });
      }
    } else if (formType === "letter") {
      const d = {
        title: formData.title, content: formData.content, topic: formData.topic,
        letter_type: formData.letter_type, level: formData.level, full_code: formData.full_code,
      };
      if (editingItem) {
        updateLetterMutation.mutate({ id: editingItem._id, data: d }, {
          onSuccess: () => { showNotification("Letter updated successfully"); closeForm(); setPagination((prev) => ({ ...prev, letters: { ...prev.letters, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to update letter", "error"),
        });
      } else {
        createLetterMutation.mutate(d, {
          onSuccess: () => { showNotification("Letter created successfully"); closeForm(); setPagination((prev) => ({ ...prev, letters: { ...prev.letters, page: 1 } })); },
          onError: (error) => showNotification(error.message || "Failed to create letter", "error"),
        });
      }
    }
  };

  const getPaginatedData = (data, tab) => {
    const filtered = data.filter((item) => {
      if (tab === "users") return item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || item.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (tab === "letters") return item.title?.toLowerCase().includes(searchQuery.toLowerCase());
      return item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const { page, itemsPerPage } = pagination[tab];
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);

    return { items: paginatedItems, totalPages, totalItems: filtered.length };
  };

  const categoriesData_paginated = getPaginatedData(categories, "categories");
  const subcategoriesData_paginated = getPaginatedData(subcategories, "subcategories");
  const topicsData_paginated = getPaginatedData(topics, "topics");
  const lettersData_paginated = getPaginatedData(letters, "letters");
  const usersData_paginated = getPaginatedData(users, "users");

  if (!isClient || userLoading || contentTreeLoading) {
    return (
      <div className={ADMIN_LOADING.screen}>
        <div className={ADMIN_LOADING.content}>
          <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <p className={ADMIN_LOADING.text}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const errorMessage = contentTreeError ? contentTreeError.message : null;
  const accentColor = ACCENT[activeTab] || ACCENT.categories;

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, from: "indigo", to: "purple", light: "indigo-50", text: "indigo-700", color: "indigo-500" },
    { label: "Total Letters", value: letters.length, icon: FileText, from: "emerald", to: "teal", light: "emerald-50", text: "emerald-700", color: "emerald-500" },
    { label: "Categories", value: categories.length, icon: Layers, from: "blue", to: "cyan", light: "blue-50", text: "blue-700", color: "blue-500" },
    { label: "Topics", value: topics.length, icon: BookOpen, from: "amber", to: "orange", light: "amber-50", text: "amber-700", color: "amber-500" },
  ];

  // Table Component
  const Table = ({ cols, rows, loading, icon: Icon, empty, tabName }) => (
    <div className={ADMIN_TABLE.container}>
      {loading ? (
        <div className={ADMIN_TABLE.loading}>
          <div className={ADMIN_TABLE.spinner(accentColor.from?.split('-')[0] || 'sky')} />
          <p className={ADMIN_TEXT.muted}>Loading…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className={ADMIN_TABLE.empty}>
          <div className={ADMIN_AVATARS.emptyIcon("gray-100")}>
            <Icon size={28} className="text-gray-400" />
          </div>
          <p className={ADMIN_TEXT.mutedMd}>{empty}</p>
        </div>
      ) : (
        <>
          <div className={ADMIN_CONTAINERS.scrollable}>
            <table className={ADMIN_TABLE.table}>
              <thead>
                <tr className={ADMIN_TABLE.tableHead}>
                  {cols.map((c) => (
                    <th key={c} className={ADMIN_TABLE.th}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
          <Pagination
            currentPage={pagination[tabName].page}
            totalPages={Math.ceil(getPaginatedData(
              tabName === "users" ? users : tabName === "letters" ? letters : tabName === "categories" ? categories : tabName === "subcategories" ? subcategories : topics,
              tabName
            ).totalPages)}
            onPageChange={(page) => handlePageChange(tabName, page)}
            totalItems={getPaginatedData(
              tabName === "users" ? users : tabName === "letters" ? letters : tabName === "categories" ? categories : tabName === "subcategories" ? subcategories : topics,
              tabName
            ).totalItems}
            itemsPerPage={pagination[tabName].itemsPerPage}
            accentColor={ACCENT[tabName] || ACCENT.categories}
          />
        </>
      )}
    </div>
  );

  const tdStyle = ADMIN_TABLE.td;

  // Render Form Modal
  const renderForm = () => {
    if (!showForm) return null;
    const ac = ACCENT[formType] || ACCENT.categories;
    return (
      <div className={ADMIN_MODAL.overlay}>
        <div className={ADMIN_MODAL.container}>
          <div className={ADMIN_MODAL.header}>
            <div>
              <span className={ADMIN_INDICATOR.dot(`${ac.from} ${ac.to}`)} />
              <span className={ADMIN_FORM.labelLarge}>{editingItem ? `Edit ${formType}` : `New ${formType}`}</span>
            </div>
            <button onClick={closeForm} className={ADMIN_MODAL.closeBtn}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {formType === "user" && (
              <>
                <div>
                  <label className={ADMIN_FORM.label}>Name *</label>
                  <input type="text" placeholder="Enter user name" value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={ADMIN_FORM.inputBase} />
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Email *</label>
                  <input type="email" placeholder="Enter email address" value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className={ADMIN_FORM.inputBase} />
                </div>
                <div className={ADMIN_PASSWORD.container}>
                  <label className={ADMIN_FORM.label}>{editingItem ? "New Password (optional)" : "Password *"}</label>
                  <input type={showPassword ? "text" : "password"} placeholder={editingItem ? "Leave blank to keep current password" : "Enter password"} value={formData.password || ""} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingItem} className={ADMIN_FORM.inputBase} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className={ADMIN_PASSWORD.toggleBtn}>{showPassword ? "Hide" : "Show"}</button>
                  {editingItem && <p className={ADMIN_PASSWORD.hint}>Current password is hidden for security. Enter a new password only if you want to change it.</p>}
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Role *</label>
                  <select value={formData.role || "user"} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required className={ADMIN_FORM.select}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {(formType === "category" || formType === "subcategory" || formType === "topic") && (
              <>
                {formType === "subcategory" && (
                  <div>
                    <label className={ADMIN_FORM.label}>Category *</label>
                    <select value={formData.category || ""} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required className={ADMIN_FORM.select}>
                      <option value="">Choose a category…</option>
                      {categories.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                    </select>
                  </div>
                )}
                {formType === "topic" && (
                  <div>
                    <label className={ADMIN_FORM.label}>Subcategory *</label>
                    <select value={formData.subcategory || ""} onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })} required className={ADMIN_FORM.select}>
                      <option value="">Choose a subcategory…</option>
                      {subcategories.map((s) => (<option key={s._id} value={s._id}>{s.name}</option>))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={ADMIN_FORM.label}>Name *</label>
                  <input type="text" placeholder={`Enter ${formType} name`} value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className={ADMIN_FORM.inputBase} />
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Slug</label>
                  <input type="text" placeholder="URL-friendly identifier (optional)" value={formData.slug || ""} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className={ADMIN_FORM.inputBase} />
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Description</label>
                  <textarea placeholder="Optional description…" value={formData.description || ""} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className={ADMIN_FORM.textarea} />
                </div>
              </>
            )}

            {formType === "letter" && (
              <>
                <div>
                  <label className={ADMIN_FORM.label}>Topic *</label>
                  <select value={formData.topic || ""} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} required className={ADMIN_FORM.select}>
                    <option value="">Choose a topic…</option>
                    {topics.map((t) => (<option key={t._id} value={t._id}>{t.name}</option>))}
                  </select>
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Title *</label>
                  <input type="text" placeholder="Enter letter title" value={formData.title || ""} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className={ADMIN_FORM.inputBase} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={ADMIN_FORM.label}>Letter Type</label>
                    <input type="text" placeholder="e.g., A, B, C" value={formData.letter_type || ""} onChange={(e) => setFormData({ ...formData, letter_type: e.target.value })} className={ADMIN_FORM.inputBase} />
                  </div>
                  <div>
                    <label className={ADMIN_FORM.label}>Level</label>
                    <input type="text" placeholder="e.g., a, b, c" value={formData.level || ""} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className={ADMIN_FORM.inputBase} />
                  </div>
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Full Code</label>
                  <input type="text" placeholder="e.g., A_a" value={formData.full_code || ""} onChange={(e) => setFormData({ ...formData, full_code: e.target.value })} className={ADMIN_FORM.inputBase} />
                </div>
                <div>
                  <label className={ADMIN_FORM.label}>Content *</label>
                  <textarea placeholder="Write the letter content…" value={formData.content || ""} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={6} className={ADMIN_FORM.textarea} />
                </div>
              </>
            )}

            <div className={ADMIN_MODAL.buttonGroup}>
              <button type="submit" className={ADMIN_MODAL.submitBtn(ac.from, ac.to)}>
                {editingItem ? "Save Changes" : "Create"}
              </button>
              <button type="button" onClick={closeForm} className={ADMIN_MODAL.cancelBtn}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease forwards; }
        .animate-slideIn { animation: slideIn 0.3s ease forwards; }
      `}</style>

      {notification && (
        <div className={ADMIN_NOTIFICATION.container}>
          <div className={ADMIN_NOTIFICATION.box(notification.type)}>
            {notification.type === "error" ? "⚠️" : "✓"} {notification.message}
          </div>
        </div>
      )}
      {renderForm()}

      <div className={ADMIN_LAYOUT.container}>
        {/* Sidebar */}
        <aside className={ADMIN_SIDEBAR.sidebar}>
          <div className={ADMIN_SIDEBAR.logo}>
            <div className={ADMIN_SIDEBAR.logoBox}>
              <div className={ADMIN_SIDEBAR.logoIcon}>
                <svg width="22" height="22" fill="#60a5fa" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div>
                <div className={ADMIN_SIDEBAR.logoText}>Admin Panel</div>
                <div className={ADMIN_SIDEBAR.logoSubText}>Words to Wellness</div>
              </div>
            </div>
          </div>

          <div className={ADMIN_SIDEBAR.search}>
            <div className={ADMIN_SEARCH.container}>
              <Search size={14} className={ADMIN_SEARCH.icon} />
              <input
                type="text"
                placeholder="Search content…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPagination((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], page: 1 } })); }}
                className={ADMIN_SIDEBAR.searchInput}
              />
            </div>
          </div>

          <nav className={ADMIN_SIDEBAR.nav}>
            <div className={ADMIN_SIDEBAR.navLabel}>Navigation</div>
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              const ac = ACCENT[item.id] || ACCENT.categories;
              return (
                <button
                  key={item.id}
                  onClick={() => { router.push(`/admin-dashboard/${item.id}`); setSearchQuery(""); setActiveTab(item.id); }}
                  className={ADMIN_NAV.navButton(active, ac.from, ac.to)}
                >
                  <item.icon size={18} color={active ? ac.from?.split('-')[0] : "rgba(255,255,255,0.4)"} />
                  <span className={ADMIN_NAV.navButtonText(active)}>{item.label}</span>
                  {active && <ChevronRight size={14} color={ac.from?.split('-')[0]} />}
                </button>
              );
            })}
          </nav>

          <div className={ADMIN_SIDEBAR.userSection}>
            <div className={ADMIN_SIDEBAR.userBox}>
              <div className={ADMIN_SIDEBAR.userAvatar}>{user?.email?.charAt(0).toUpperCase() || "A"}</div>
              <div className="overflow-hidden flex-1">
                <div className={ADMIN_USER.email}>{user?.email}</div>
                <div className="text-xs text-indigo-400 font-medium">Administrator</div>
              </div>
            </div>
            <button onClick={handleLogout} className={ADMIN_SIDEBAR.logoutBtn}>
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={ADMIN_LAYOUT.main}>
          <header className={ADMIN_HEADER.topbar}>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r from-${accentColor.from} to-${accentColor.to} text-white text-xs font-bold shadow-md flex items-center gap-1.5`}>
                <Shield size={14} /> Admin
              </div>
              <span className="text-gray-400 text-sm">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</span>
            </div>
          </header>

          <div className={ADMIN_CONTENT.area}>
            {errorMessage && <div className={ADMIN_ERROR.banner}>⚠️ {errorMessage}</div>}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="animate-fadeIn">
                <div className={ADMIN_WELCOME.container}>
                  <h1 className={ADMIN_WELCOME.title}>Good morning 👋</h1>
                  <p className={ADMIN_WELCOME.subtitle}>Here's what's happening on your platform today.</p>
                </div>

                <div className={ADMIN_STATS.grid}>
                  {stats.map((s, i) => (
                    <div key={i} className={ADMIN_STATS.card}>
                      <div className={ADMIN_STATS.cardHeader}>
                        <div className={ADMIN_STATS.iconWrapper(s.from, s.to)}>
                          <s.icon size={22} className={ADMIN_STATS.icon(s.color)} />
                        </div>
                        <div className={ADMIN_STATS.trendBadge(s.light, s.text)}>
                          <TrendingUp size={12} /> +12%
                        </div>
                      </div>
                      <div>
                        <div className={ADMIN_STATS.value}>{s.value}</div>
                        <div className={ADMIN_STATS.label}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Content Breakdown */}
                  <div className={ADMIN_CONTENT_BREAKDOWN.container}>
                    <div className={ADMIN_CONTENT_BREAKDOWN.header}>
                      <h2 className={ADMIN_CONTENT_BREAKDOWN.title}>Content Breakdown</h2>
                    </div>
                    {[
                      { label: "Categories", value: categories.length, color: "indigo" },
                      { label: "Subcategories", value: subcategories.length, color: "emerald" },
                      { label: "Topics", value: topics.length, color: "sky" },
                      { label: "Letters", value: letters.length, color: "amber" },
                    ].map((item, i) => {
                      const total = categories.length + subcategories.length + topics.length + letters.length || 1;
                      const pct = Math.round((item.value / total) * 100);
                      return (
                        <div key={i} className={ADMIN_CONTENT_BREAKDOWN.item}>
                          <div className={ADMIN_CONTENT_BREAKDOWN.itemHeader}>
                            <span>{item.label}</span>
                            <span className={ADMIN_CONTENT_BREAKDOWN.itemValue(item.color)}>{item.value}</span>
                          </div>
                          <div className={ADMIN_CONTENT_BREAKDOWN.progressBar}>
                            <div className={ADMIN_CONTENT_BREAKDOWN.progressFill(item.color)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className={ADMIN_QUICK_ACTIONS.container}>
                    <h2 className={ADMIN_QUICK_ACTIONS.title}>Quick Actions</h2>
                    <div className={ADMIN_QUICK_ACTIONS.buttonContainer}>
                      {[
                        { label: "Add User", type: "user", ...ACCENT.users },
                        { label: "Add Category", type: "category", ...ACCENT.categories },
                        { label: "Add Subcategory", type: "subcategory", ...ACCENT.subcategories },
                        { label: "Add Topic", type: "topic", ...ACCENT.topics },
                        { label: "Add Letter", type: "letter", ...ACCENT.letters },
                      ].map((a, i) => (
                        <button
                          key={i}
                          onClick={() => openForm(a.type)}
                          className={ADMIN_QUICK_ACTIONS.button(a.light)}
                        >
                          <div className={ADMIN_QUICK_ACTIONS.buttonIcon(a.from, a.to)}>
                            <Plus size={16} className="text-white" />
                          </div>
                          <span className={ADMIN_QUICK_ACTIONS.buttonLabel(a.text)}>{a.label}</span>
                          <ChevronRight size={16} className={ADMIN_QUICK_ACTIONS.buttonArrow(a.from?.split('-')[0])} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="animate-fadeIn">
                <PageHeader title="Users" subtitle="Manage user accounts and permissions" count={usersData_paginated.totalItems} action={<AddBtn label="User" onClick={() => openForm("user")} ac={ACCENT.users} />} />
                <Table
                  cols={["User", "Email", "Role", "Joined", "Actions"]}
                  icon={Users}
                  empty="No users found"
                  loading={usersLoading}
                  tabName="users"
                  rows={usersData_paginated.items.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className={tdStyle}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{u.name?.charAt(0).toUpperCase() || "U"}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{u.name}</span>
                        </div>
                      </td>
                      <td className={tdStyle}><span className="text-gray-500">{u.email}</span></td>
                      <td className={tdStyle}><span className={ADMIN_BADGES.badge(u.role === "admin" ? "purple-50" : "blue-50", u.role === "admin" ? "purple-700" : "blue-700")}>{u.role}</span></td>
                      <td className={`${tdStyle} text-gray-400`}>{formatDate(u.createdAt)}</td>
                      <td className={tdStyle}>
                        <div className="flex gap-2">
                          <button onClick={() => openForm("user", u)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete("user", u._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="animate-fadeIn">
                <PageHeader title="Categories" subtitle="Manage content categories" count={categoriesData_paginated.totalItems} action={<AddBtn label="Category" onClick={() => openForm("category")} ac={ACCENT.categories} />} />
                <Table
                  cols={["Category", "Description", "Created", "Actions"]}
                  icon={Layers}
                  empty="No categories yet. Add a category to see it here."
                  loading={contentTreeLoading}
                  tabName="categories"
                  rows={categoriesData_paginated.items.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                      <td className={tdStyle}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"><Layers size={14} className="text-white" /></div>
                          <span className="font-semibold text-gray-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className={`${tdStyle} max-w-xs`}>
                        <span className={`${!cat.description || cat.description === "NULL" ? 'text-gray-400 italic' : 'text-gray-500'} truncate block`}>
                          {!cat.description || cat.description === "NULL" ? "No Description" : cat.description}
                        </span>
                      </td>
                      <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(cat.createdAt)}</td>
                      <td className={tdStyle}>
                        <div className="flex gap-2">
                          <button onClick={() => openForm("category", cat)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete("category", cat._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              </div>
            )}

            {/* Subcategories Tab */}
            {activeTab === "subcategories" && (
              <div className="animate-fadeIn">
                <PageHeader title="Subcategories" subtitle="Manage content subcategories" count={subcategoriesData_paginated.totalItems} action={<AddBtn label="Subcategory" onClick={() => openForm("subcategory")} ac={ACCENT.subcategories} />} />
                <Table
                  cols={["Subcategory", "Description", "Created", "Actions"]}
                  icon={FolderTree}
                  empty="No subcategories yet"
                  loading={contentTreeLoading}
                  tabName="subcategories"
                  rows={subcategoriesData_paginated.items.map((sub) => (
                    <tr key={sub._id} className="hover:bg-gray-50 transition-colors">
                      <td className={tdStyle}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"><FolderTree size={14} className="text-white" /></div>
                          <span className="font-semibold text-gray-900">{sub.name}</span>
                        </div>
                      </td>
                      <td className={`${tdStyle} max-w-xs`}>
                        <span className={`${!sub.description || sub.description === "NULL" ? 'text-gray-400 italic' : 'text-gray-500'} truncate block`}>
                          {!sub.description || sub.description === "NULL" ? "No Description" : sub.description}
                        </span>
                      </td>
                      <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(sub.createdAt)}</td>
                      <td className={tdStyle}>
                        <div className="flex gap-2">
                          <button onClick={() => openForm("subcategory", sub)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete("subcategory", sub._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === "topics" && (
              <div className="animate-fadeIn">
                <PageHeader title="Topics" subtitle="Manage content topics" count={topicsData_paginated.totalItems} action={<AddBtn label="Topic" onClick={() => openForm("topic")} ac={ACCENT.topics} />} />
                <Table
                  cols={["Topic", "Description", "Created", "Actions"]}
                  icon={BookOpen}
                  empty="No topics yet"
                  loading={contentTreeLoading}
                  tabName="topics"
                  rows={topicsData_paginated.items.map((topic) => (
                    <tr key={topic._id} className="hover:bg-gray-50 transition-colors">
                      <td className={tdStyle}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center"><BookOpen size={14} className="text-white" /></div>
                          <span className="font-semibold text-gray-900">{topic.name}</span>
                        </div>
                      </td>
                      <td className={`${tdStyle} max-w-xs`}>
                        <span className={`${!topic.description || topic.description === "NULL" ? 'text-gray-400 italic' : 'text-gray-500'} truncate block`}>
                          {!topic.description || topic.description === "NULL" ? "No Description" : topic.description}
                        </span>
                      </td>
                      <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(topic.createdAt)}</td>
                      <td className={tdStyle}>
                        <div className="flex gap-2">
                          <button onClick={() => openForm("topic", topic)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete("topic", topic._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              </div>
            )}

            {/* Letters Tab */}
            {activeTab === "letters" && (
              <div className="animate-fadeIn">
                <PageHeader title="Letters" subtitle="Manage all wellness letters" count={lettersData_paginated.totalItems} action={<AddBtn label="Letter" onClick={() => openForm("letter")} ac={ACCENT.letters} />} />
                <Table
                  cols={["Letter", "Type", "Content Preview", "Created", "Actions"]}
                  icon={FileText}
                  empty="No letters yet"
                  loading={contentTreeLoading}
                  tabName="letters"
                  rows={lettersData_paginated.items.map((letter) => (
                    <tr key={letter._id} className="hover:bg-gray-50 transition-colors">
                      <td className={tdStyle}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center"><FileText size={14} className="text-white" /></div>
                          <span className="font-semibold text-gray-900">{letter.title}</span>
                        </div>
                      </td>
                      <td className={tdStyle}><span className="font-semibold text-gray-700">{letter.letter_type || "—"}</span></td>
                      <td className={`${tdStyle} max-w-md`}>
                        <span className="text-gray-500 truncate block">{letter.content?.substring(0, 100) || "—"}</span>
                      </td>
                      <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(letter.createdAt)}</td>
                      <td className={tdStyle}>
                        <div className="flex gap-2">
                          <button onClick={() => openForm("letter", letter)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete("letter", letter._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}