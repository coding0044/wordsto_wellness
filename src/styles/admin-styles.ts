/**
 * Admin Dashboard Inline Style Constants
 * Extracted from admin-dashboard-client.tsx for cleaner code
 */

// ============ Layout & Containers ============
export const ADMIN_LAYOUT = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'system-ui,-apple-system,sans-serif',
    background: '#f8fafc',
  } as const,
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    minWidth: 0,
  } as const,
  sidebar: {
    width: 260,
    background: 'linear-gradient(180deg,#0f0c29 0%,#1e1b4b 50%,#0f0c29 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'sticky' as const,
    top: 0,
    height: '100vh',
    flexShrink: 0,
    borderRight: '1px solid rgba(255,255,255,0.05)',
  } as const,
};

// ============ Header ============
export const ADMIN_HEADER = {
  topbar: {
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 32px',
    height: 68,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  } as const,
};

// ============ Sidebar Elements ============
export const ADMIN_SIDEBAR = {
  logo: {
    padding: '28px 24px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  } as const,
  logoBox: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: 14,
  } as const,
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    boxShadow: '0 8px 24px #6366f160',
  } as const,
  logoText: {
    color: '#fff',
    fontWeight: 800,
    fontSize: 16,
    letterSpacing: '-0.02em',
  } as const,
  logoSubText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: 500,
    marginTop: 1,
  } as const,
  search: {
    padding: '16px 16px 8px',
  } as const,
  searchInput: {
    width: '100%',
    padding: '10px 12px 10px 34px',
    background: 'rgba(255,255,255,0.12)',
    border: '1.5px solid rgba(129,140,248,0.3)',
    borderRadius: 12,
    color: '#fff',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s, background 0.2s',
  } as const,
  nav: {
    flex: 1,
    padding: '8px 12px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 2,
  } as const,
  navLabel: {
    padding: '8px 12px 6px',
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  } as const,
  userSection: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.07)',
  } as const,
  userBox: {
    display: 'flex',
    alignItems: 'center' as const,
    gap: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    marginBottom: 8,
  } as const,
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#818cf8,#6366f1)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  } as const,
  logoutBtn: {
    width: '100%',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(239,68,68,0.1)',
    cursor: 'pointer' as const,
    color: '#f87171',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.15s',
  } as const,
};

// ============ Pagination ============
export const ADMIN_PAGINATION = {
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: '16px 20px',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
    flexWrap: 'wrap' as const,
    gap: '12px',
  } as const,
  info: {
    fontSize: 13,
    color: '#64748b',
  } as const,
  buttonGroup: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center' as const,
  } as const,
  buttonBase: (disabled: boolean) => ({
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: disabled ? '#f1f5f9' : '#fff',
    cursor: disabled ? 'not-allowed' as const : 'pointer' as const,
    color: disabled ? '#94a3b8' : '#475569',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 4,
    fontSize: 13,
    transition: 'all 0.15s',
  }),
  pageButton: (isActive: boolean, from?: string, to?: string) => ({
    padding: '8px 14px',
    borderRadius: 8,
    border: isActive ? 'none' : '1px solid #e2e8f0',
    background: isActive ? `linear-gradient(135deg, ${from}, ${to})` : '#fff',
    color: isActive ? '#fff' : '#475569',
    cursor: 'pointer' as const,
    fontWeight: isActive ? 600 : 400,
    fontSize: 13,
    transition: 'all 0.15s',
  }),
  ellipsis: {
    padding: '8px 4px',
    color: '#94a3b8',
  } as const,
};

// ============ Form Inputs ============
export const ADMIN_FORM = {
  inputBase: {
    width: '100%',
    padding: '12px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 14,
    fontFamily: 'system-ui',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    background: '#fff',
    color: '#1e293b',
  } as const,
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#475569',
    display: 'block' as const,
    marginBottom: 8,
  } as const,
  labelLarge: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: 'system-ui',
  } as const,
  group: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 20,
  } as const,
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  } as const,
  fieldGroup: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
  } as const,
};

// ============ Modal ============
export const ADMIN_MODAL = {
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(15,12,41,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1000,
    padding: 16,
  } as const,
  container: {
    background: '#fff',
    borderRadius: 24,
    padding: 36,
    maxWidth: 560,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
    border: '1px solid rgba(255,255,255,0.8)',
  } as const,
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 28,
  } as const,
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#0f172a',
    fontFamily: 'system-ui',
  } as const,
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'pointer' as const,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as const,
  buttonGroup: {
    display: 'flex',
    gap: 12,
    paddingTop: 8,
  } as const,
  submitBtn: (from: string, to: string) => ({
    flex: 1,
    padding: '13px 20px',
    background: `linear-gradient(135deg,${from},${to})`,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer' as const,
    fontFamily: 'system-ui',
    letterSpacing: 0.3,
    boxShadow: `0 8px 24px ${from}40`,
  }),
  cancelBtn: {
    flex: 1,
    padding: '13px 20px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer' as const,
    fontFamily: 'system-ui',
  } as const,
};

// ============ Table ============
export const ADMIN_TABLE = {
  container: {
    background: '#fff',
    borderRadius: 20,
    border: '1px solid #e2e8f0',
    overflow: 'hidden' as const,
    boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
  } as const,
  loading: {
    padding: 48,
    textAlign: 'center' as const,
  } as const,
  empty: {
    padding: 64,
    textAlign: 'center' as const,
  } as const,
  spinner: (accentColor: string) => ({
    width: 40,
    height: 40,
    border: '3px solid #e2e8f0',
    borderTop: `3px solid ${accentColor}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px',
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  } as const,
  tableHead: {
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  } as const,
  th: {
    padding: '14px 20px',
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    fontFamily: 'system-ui',
    whiteSpace: 'nowrap' as const,
  } as const,
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: 14,
    color: '#334155',
    fontFamily: 'system-ui',
    verticalAlign: 'middle' as const,
  } as const,
};

// ============ Avatars & Badges ============
export const ADMIN_AVATARS = {
  avatar: (from: string, to: string) => ({
    width: 38,
    height: 38,
    borderRadius: 12,
    background: `linear-gradient(135deg,${from},${to})`,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    flexShrink: 0,
  }),
  emptyIcon: (from: string, to: string) => ({
    width: 64,
    height: 64,
    borderRadius: 20,
    background: from,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    margin: '0 auto 16px',
  }),
};

export const ADMIN_BADGES = {
  badge: (bg: string, text: string) => ({
    display: 'inline-flex',
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    background: bg,
    color: text,
  }),
};

// ============ Action Buttons ============
export const ADMIN_BUTTONS = {
  actionBase: {
    padding: 8,
    borderRadius: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer' as const,
    display: 'inline-flex',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    transition: 'background 0.15s',
  } as const,
};

// ============ Loading States ============
export const ADMIN_LOADING = {
  screen: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as const,
  content: {
    textAlign: 'center' as const,
  } as const,
  icon: {
    margin: '0 auto 24px',
  } as const,
  text: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontFamily: 'system-ui',
  } as const,
};

// ============ Notifications ============
export const ADMIN_NOTIFICATION = {
  container: {
    position: 'fixed' as const,
    top: 20,
    right: 20,
    zIndex: 2000,
    animation: 'slideIn 0.3s ease',
  } as const,
  box: (type: 'success' | 'error') => ({
    padding: '14px 20px',
    borderRadius: 12,
    background: type === 'error' ? '#fef2f2' : '#ecfdf5',
    border: `1.5px solid ${type === 'error' ? '#fecaca' : '#a7f3d0'}`,
    color: type === 'error' ? '#dc2626' : '#059669',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
  }),
};

// ============ Content Area ============
export const ADMIN_CONTENT = {
  area: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto' as const,
    animation: 'fadeIn 0.3s ease',
  } as const,
};

// ============ Dot Indicator ============
export const ADMIN_INDICATOR = {
  dot: (color: string) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    display: 'inline-block' as const,
    marginRight: 10,
    verticalAlign: 'middle' as const,
  }),
};

// ============ Password Field ============
export const ADMIN_PASSWORD = {
  container: {
    position: 'relative' as const,
  } as const,
  toggleBtn: {
    position: 'absolute' as const,
    right: 12,
    top: 40,
    border: 'none',
    background: 'transparent',
    color: '#475569',
    fontSize: 13,
    cursor: 'pointer' as const,
    padding: '0 6px',
  } as const,
  hint: {
    margin: '8px 0 0',
    color: '#64748b',
    fontSize: 12,
  } as const,
};

// ============ Search Helper ============
export const ADMIN_SEARCH = {
  container: {
    position: 'relative' as const,
  } as const,
  icon: {
    position: 'absolute' as const,
    left: 12,
    top: '50%',
    transform: 'translateY(-50%)',
  } as const,
};

// ============ Navigation Items ============
export const ADMIN_NAV = {
  navLabel: {
    padding: '8px 12px 6px',
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  } as const,
  navButton: (active: boolean, accentFrom: string, accentTo: string) => ({
    width: '100%',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 12,
    padding: '11px 14px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer' as const,
    background: active ? `linear-gradient(135deg,${accentFrom}22,${accentTo}22)` : 'transparent',
    transition: 'background 0.15s',
    textAlign: 'left' as const,
    borderLeft: active ? `3px solid ${accentFrom}` : '3px solid transparent',
  }),
  navButtonText: (active: boolean) => ({
    fontSize: 14,
    fontWeight: active ? 700 : 500,
    color: active ? '#f1f5f9' : 'rgba(255,255,255,0.5)',
    flex: 1,
  }),
};

// ============ User Info Section ============
export const ADMIN_USER = {
  container: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    marginBottom: 8,
  } as const,
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#818cf8,#6366f1)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    fontSize: 14,
    fontWeight: 700,
    color: '#fff',
    flexShrink: 0,
  } as const,
  email: {
    fontSize: 12,
    fontWeight: 700,
    color: '#e2e8f0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as const,
  logoutButton: {
    width: '100%',
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: 'rgba(239,68,68,0.1)',
    cursor: 'pointer' as const,
    color: '#f87171',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 0.15s',
  } as const,
};

// ============ Error Messages ============
export const ADMIN_ERROR = {
  banner: {
    maxWidth: 1100,
    margin: '0 auto 20px',
    padding: '16px 20px',
    borderRadius: 18,
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#b91c1c',
    fontSize: 14,
    fontWeight: 600,
  } as const,
};

// ============ Text Elements ============
export const ADMIN_TEXT = {
  muted: {
    color: '#94a3b8',
    fontFamily: 'system-ui',
    fontSize: 14,
  } as const,
  mutedMd: {
    color: '#94a3b8',
    fontFamily: 'system-ui',
    fontSize: 15,
    fontWeight: 500,
  } as const,
  tableHeader: {
    padding: '14px 20px',
    textAlign: 'left' as const,
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    fontFamily: 'system-ui',
    whiteSpace: 'nowrap' as const,
  } as const,
};

// ============ Containers ============
export const ADMIN_CONTAINERS = {
  scrollable: {
    overflowX: 'auto' as const,
  } as const,
};

// ============ Flex Utilities ============
export const ADMIN_FLEX = {
  between: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  } as const,
  center: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } as const,
  start: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 10,
  } as const,
};
