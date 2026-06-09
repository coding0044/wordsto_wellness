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
import {
  formatDate,
  getMutationMap,
  getPaginationKey,
  getDataByTab,
  getEmptyMessage,
  getTableIcon,
  getTableColumns,
  isAdminUser,
  getUserInitials,
  getAvatarGradient,
  getRoleBadgeStyles,
  filterBySearchQuery,
  getPaginatedItems,
  calculateTotalPages,
  getPageNumbers,
  getPaginatedData,
  getFormFields,
  prepareMutationData,
  calculateStats,
  getContentBreakdownItems,
  getQuickActionsItems,
  getSuccessMessage,
  resetPaginationForTab,
  handleApiError,
} from "@helpers/admin-dashboard";

const NAV_ITEMS = ADMIN_PAGES;
const ACCENT = ADMIN_ACCENT_COLORS;

// ==================== PAGINATION COMPONENT ====================

function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage, accentColor }) {
  const getPageNumbersForDisplay = () => getPageNumbers(currentPage, totalPages);

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
        {getPageNumbersForDisplay().map((page, index) =>
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

// ==================== PAGE HEADER COMPONENT ====================

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

// ==================== ADD BUTTON COMPONENT ====================

function AddBtn({ label, onClick, ac }) {
  return (
    <button onClick={onClick} className={ADMIN_ADD_BUTTON.button(ac.from, ac.to)}>
      <Plus size={16} className={ADMIN_ADD_BUTTON.icon} />
      Add {label}
    </button>
  );
}

// ==================== MAIN COMPONENT ====================

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
    if (user && !isAdminUser(user)) {
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
      setFormData(createFormDataFromItem(item, type));
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
          showNotification(getSuccessMessage(type, "delete"));
          queryClient.invalidateQueries(["users"]);
        })
        .catch((error) => handleApiError(error, showNotification, `Failed to delete ${type}`));
    } else {
      const mutationMap = getMutationMap(
        deleteCategoryMutation,
        deleteSubcategoryMutation,
        deleteTopicMutation,
        deleteLetterMutation
      );
      
      mutationMap[type]?.mutate(id, {
        onSuccess: () => {
          showNotification(getSuccessMessage(type, "delete"));
          resetPaginationForTab(setPagination, getPaginationKey(type));
        },
        onError: (error) => handleApiError(error, showNotification, `Failed to delete ${type}`),
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

    const mutationMap = {
      user: { create: createAdminUser, update: updateAdminUser, isService: true },
      category: { create: createCategoryMutation, update: updateCategoryMutation, isService: false },
      subcategory: { create: createSubcategoryMutation, update: updateSubcategoryMutation, isService: false },
      topic: { create: createTopicMutation, update: updateTopicMutation, isService: false },
      letter: { create: createLetterMutation, update: updateLetterMutation, isService: false },
    };

    const mutation = mutationMap[formType];
    if (!mutation) return;

    const data = prepareMutationData(formType, formData, editingItem);
    
    const onSuccessCallback = () => {
      showNotification(getSuccessMessage(formType, editingItem ? "update" : "create"));
      closeForm();
      resetPaginationForTab(setPagination, getPaginationKey(formType));
      if (formType !== "user") {
        queryClient.invalidateQueries(["contentTree"]);
      } else {
        queryClient.invalidateQueries(["users"]);
      }
    };

    const onErrorCallback = (error) => {
      handleApiError(error, showNotification, `Failed to ${editingItem ? "update" : "create"} ${formType}`);
    };

    if (mutation.isService) {
      const action = editingItem ? mutation.update(editingItem._id, data) : mutation.create(data);
      action.then(onSuccessCallback).catch(onErrorCallback);
    } else {
      const action = editingItem 
        ? mutation.update.mutate({ id: editingItem._id, data }) 
        : mutation.create.mutate(data);
      
      if (editingItem) {
        mutation.update.mutate({ id: editingItem._id, data }, { onSuccess: onSuccessCallback, onError: onErrorCallback });
      } else {
        mutation.create.mutate(data, { onSuccess: onSuccessCallback, onError: onErrorCallback });
      }
    }
  };

  const categoriesData_paginated = getPaginatedData(categories, "categories", searchQuery, pagination);
  const subcategoriesData_paginated = getPaginatedData(subcategories, "subcategories", searchQuery, pagination);
  const topicsData_paginated = getPaginatedData(topics, "topics", searchQuery, pagination);
  const lettersData_paginated = getPaginatedData(letters, "letters", searchQuery, pagination);
  const usersData_paginated = getPaginatedData(users, "users", searchQuery, pagination);

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
  const stats = calculateStats(users, letters, categories, topics);
  const contentBreakdownItems = getContentBreakdownItems(categories, subcategories, topics, letters);
  const quickActionsItems = getQuickActionsItems();

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
            totalPages={getPaginatedData(
              getDataByTab(tabName, categories, subcategories, topics, letters, users),
              tabName,
              searchQuery,
              pagination
            ).totalPages}
            onPageChange={(page) => handlePageChange(tabName, page)}
            totalItems={getPaginatedData(
              getDataByTab(tabName, categories, subcategories, topics, letters, users),
              tabName,
              searchQuery,
              pagination
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
    const formFields = getFormFields(formType, categories, subcategories, topics);

    const renderField = (field) => {
      if (field.type === "select") {
        return (
          <div key={field.name}>
            <label className={ADMIN_FORM.label}>{field.label}</label>
            <select 
              value={formData[field.name] || ""} 
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} 
              required={field.required} 
              className={ADMIN_FORM.select}
            >
              <option value="">Choose a {field.label.toLowerCase()}…</option>
              {field.options.map((opt) => (
                <option key={opt[field.optionKey]} value={opt[field.optionKey]}>
                  {opt[field.optionLabel]}
                </option>
              ))}
            </select>
          </div>
        );
      }
      
      if (field.type === "textarea") {
        return (
          <div key={field.name}>
            <label className={ADMIN_FORM.label}>{field.label}</label>
            <textarea 
              placeholder={field.placeholder} 
              value={formData[field.name] || ""} 
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} 
              required={field.required} 
              rows={field.rows} 
              className={ADMIN_FORM.textarea} 
            />
          </div>
        );
      }
      
      if (field.name === "password" && formType === "user") {
        return (
          <div key={field.name} className={ADMIN_PASSWORD.container}>
            <label className={ADMIN_FORM.label}>{field.label}</label>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder={editingItem ? "Leave blank to keep current password" : field.placeholder} 
              value={formData.password || ""} 
              onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required={!editingItem && field.required} 
              className={ADMIN_FORM.inputBase} 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className={ADMIN_PASSWORD.toggleBtn}>
              {showPassword ? "Hide" : "Show"}
            </button>
            {editingItem && <p className={ADMIN_PASSWORD.hint}>Current password is hidden for security. Enter a new password only if you want to change it.</p>}
          </div>
        );
      }
      
      return (
        <div key={field.name}>
          <label className={ADMIN_FORM.label}>{field.label}</label>
          <input 
            type={field.type} 
            placeholder={field.placeholder} 
            value={formData[field.name] || ""} 
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })} 
            required={field.required} 
            className={ADMIN_FORM.inputBase} 
          />
        </div>
      );
    };

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
            {formFields.map(renderField)}
            
            {formType === "letter" && (
              <div className="grid grid-cols-2 gap-3">
                {/* This is handled by the field renderer now */}
              </div>
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

  const renderUserRow = (u) => {
    const roleStyles = getRoleBadgeStyles(u.role);
    return (
      <tr key={u._id} className="hover:bg-gray-50 transition-colors">
        <td className={tdStyle}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient("user")} flex items-center justify-center`}>
              <span className="text-white text-sm font-bold">{getUserInitials(u.name)}</span>
            </div>
            <span className="font-semibold text-gray-900">{u.name}</span>
          </div>
        </td>
        <td className={tdStyle}><span className="text-gray-500">{u.email}</span></td>
        <td className={tdStyle}><span className={ADMIN_BADGES.badge(roleStyles.bg, roleStyles.text)}>{u.role}</span></td>
        <td className={`${tdStyle} text-gray-400`}>{formatDate(u.createdAt)}</td>
        <td className={tdStyle}>
          <div className="flex gap-2">
            <button onClick={() => openForm("user", u)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
            <button onClick={() => handleDelete("user", u._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
          </div>
        </td>
      </tr>
    );
  };

  const renderContentRow = (item, type) => {
    return (
      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
        <td className={tdStyle}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarGradient(type)} flex items-center justify-center`}>
              {type === "category" && <Layers size={14} className="text-white" />}
              {type === "subcategory" && <FolderTree size={14} className="text-white" />}
              {type === "topic" && <BookOpen size={14} className="text-white" />}
              {type === "letter" && <FileText size={14} className="text-white" />}
            </div>
            <span className="font-semibold text-gray-900">{item.name || item.title}</span>
          </div>
        </td>
        {type === "letter" && (
          <td className={tdStyle}><span className="font-semibold text-gray-700">{item.letter_type || "—"}</span></td>
        )}
        <td className={`${tdStyle} max-w-xs`}>
          <span className={`${(!item.description || item.description === "NULL") && type !== "letter" ? 'text-gray-400 italic' : 'text-gray-500'} truncate block`}>
            {type === "letter" 
              ? (item.content?.substring(0, 100) || "—")
              : (!item.description || item.description === "NULL" ? "No Description" : item.description)
            }
          </span>
        </td>
        {type !== "letter" && (
          <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(item.createdAt)}</td>
        )}
        {type === "letter" && (
          <td className={`${tdStyle} text-gray-400 whitespace-nowrap`}>{formatDate(item.createdAt)}</td>
        )}
        <td className={tdStyle}>
          <div className="flex gap-2">
            <button onClick={() => openForm(type, item)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.editBtn}`}><Edit2 size={15} /></button>
            <button onClick={() => handleDelete(type, item._id)} className={`${ADMIN_BUTTONS.actionBase} ${ADMIN_BUTTONS.deleteBtn}`}><Trash2 size={15} /></button>
          </div>
        </td>
      </tr>
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
                onChange={(e) => { setSearchQuery(e.target.value); resetPaginationForTab(setPagination, activeTab); }}
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
              <div className={ADMIN_SIDEBAR.userAvatar}>{getUserInitials(user?.email)}</div>
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
                    {contentBreakdownItems.map((item, i) => (
                      <div key={i} className={ADMIN_CONTENT_BREAKDOWN.item}>
                        <div className={ADMIN_CONTENT_BREAKDOWN.itemHeader}>
                          <span>{item.label}</span>
                          <span className={ADMIN_CONTENT_BREAKDOWN.itemValue(item.color)}>{item.value}</span>
                        </div>
                        <div className={ADMIN_CONTENT_BREAKDOWN.progressBar}>
                          <div className={ADMIN_CONTENT_BREAKDOWN.progressFill(item.color)} style={{ width: `${item.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className={ADMIN_QUICK_ACTIONS.container}>
                    <h2 className={ADMIN_QUICK_ACTIONS.title}>Quick Actions</h2>
                    <div className={ADMIN_QUICK_ACTIONS.buttonContainer}>
                      {quickActionsItems.map((a, i) => (
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
                  cols={getTableColumns("users")}
                  icon={getTableIcon("users")}
                  empty={getEmptyMessage("users")}
                  loading={usersLoading}
                  tabName="users"
                  rows={usersData_paginated.items.map(renderUserRow)}
                />
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === "categories" && (
              <div className="animate-fadeIn">
                <PageHeader title="Categories" subtitle="Manage content categories" count={categoriesData_paginated.totalItems} action={<AddBtn label="Category" onClick={() => openForm("category")} ac={ACCENT.categories} />} />
                <Table
                  cols={getTableColumns("categories")}
                  icon={getTableIcon("categories")}
                  empty={getEmptyMessage("categories")}
                  loading={contentTreeLoading}
                  tabName="categories"
                  rows={categoriesData_paginated.items.map((item) => renderContentRow(item, "category"))}
                />
              </div>
            )}

            {/* Subcategories Tab */}
            {activeTab === "subcategories" && (
              <div className="animate-fadeIn">
                <PageHeader title="Subcategories" subtitle="Manage content subcategories" count={subcategoriesData_paginated.totalItems} action={<AddBtn label="Subcategory" onClick={() => openForm("subcategory")} ac={ACCENT.subcategories} />} />
                <Table
                  cols={getTableColumns("subcategories")}
                  icon={getTableIcon("subcategories")}
                  empty={getEmptyMessage("subcategories")}
                  loading={contentTreeLoading}
                  tabName="subcategories"
                  rows={subcategoriesData_paginated.items.map((item) => renderContentRow(item, "subcategory"))}
                />
              </div>
            )}

            {/* Topics Tab */}
            {activeTab === "topics" && (
              <div className="animate-fadeIn">
                <PageHeader title="Topics" subtitle="Manage content topics" count={topicsData_paginated.totalItems} action={<AddBtn label="Topic" onClick={() => openForm("topic")} ac={ACCENT.topics} />} />
                <Table
                  cols={getTableColumns("topics")}
                  icon={getTableIcon("topics")}
                  empty={getEmptyMessage("topics")}
                  loading={contentTreeLoading}
                  tabName="topics"
                  rows={topicsData_paginated.items.map((item) => renderContentRow(item, "topic"))}
                />
              </div>
            )}

            {/* Letters Tab */}
            {activeTab === "letters" && (
              <div className="animate-fadeIn">
                <PageHeader title="Letters" subtitle="Manage all wellness letters" count={lettersData_paginated.totalItems} action={<AddBtn label="Letter" onClick={() => openForm("letter")} ac={ACCENT.letters} />} />
                <Table
                  cols={getTableColumns("letters")}
                  icon={getTableIcon("letters")}
                  empty={getEmptyMessage("letters")}
                  loading={contentTreeLoading}
                  tabName="letters"
                  rows={lettersData_paginated.items.map((item) => renderContentRow(item, "letter"))}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}