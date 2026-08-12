import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock Initial Data Fallbacks for Vercel Preview
const MOCK_PROJECTS = [
  {
    id: 'proj-1',
    name: 'Enterprise App Redesign',
    description: 'Modernizing corporate UI/UX with dark blue corporate aesthetics, responsive sidebars, and velocity tracking.',
    owner_id: 'admin-id',
    stats: { total: 4, done: 2, in_progress: 1, todo: 1, progress: 50 },
    members: [
      { id: 'm-1', user_id: 'admin-id', role: 'OWNER', user: { id: 'admin-id', full_name: 'Elena Rostova (Admin)', email: 'admin@acme.com', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
      { id: 'm-2', user_id: 'user-alex', role: 'MEMBER', user: { id: 'user-alex', full_name: 'Alex Rivera', email: 'alex@acme.com', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' } },
    ],
    tasks: [
      { id: 't-1', title: 'Design Glassmorphic Command Palette', description: 'Build Cmd+K quick search modal', status: 'DONE', priority: 'HIGH', assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
      { id: 't-2', title: 'Implement Dual Light/Dark Theme Engine', description: 'Tailwind CSS theme tokens with HSL palette', status: 'DONE', priority: 'HIGH', assignee: { full_name: 'Alex Rivera', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' } },
      { id: 't-3', title: 'Setup Executive PDF Exporter', description: 'Print stylesheet report modal generator', status: 'IN_PROGRESS', priority: 'HIGH', assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
      { id: 't-4', title: 'Framer Motion Spring Physics', description: 'Page enter transition and hover physics', status: 'TODO', priority: 'MEDIUM', assignee: null },
    ],
  },
  {
    id: 'proj-2',
    name: 'Authentication & RBAC Middleware',
    description: 'JWT token authentication with role-based access control for ADMIN and USER tiers.',
    owner_id: 'admin-id',
    stats: { total: 3, done: 3, in_progress: 0, todo: 0, progress: 100 },
    members: [
      { id: 'm-3', user_id: 'admin-id', role: 'OWNER', user: { id: 'admin-id', full_name: 'Elena Rostova (Admin)', email: 'admin@acme.com', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
    ],
    tasks: [
      { id: 't-5', title: 'JWT Access & Refresh Token Service', description: 'Verify bearer tokens and issue cookies', status: 'DONE', priority: 'HIGH', assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
      { id: 't-6', title: 'Role Guard Middleware', description: 'Block standard users from GET /api/users', status: 'DONE', priority: 'HIGH', assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
      { id: 't-7', title: 'Bcrypt Password Hash Salt', description: 'Secure password hashing on registration', status: 'DONE', priority: 'MEDIUM', assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } },
    ],
  },
];

// Interceptor to attach stored access token if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor with graceful mock fallback on Vercel or network error
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isVercelHost = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

    // Handle 401 token refresh if on local server
    if (!isVercelHost && error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        if (res.data.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
      }
    }

    // Graceful Fallback for Vercel Host or Network Errors
    if (isVercelHost || !error.response || error.code === 'ERR_NETWORK' || error.response?.status === 404) {
      const url = originalRequest.url || '';

      if (url.includes('/projects')) {
        const match = url.match(/\/projects\/([^\/]+)/);
        if (match) {
          const found = MOCK_PROJECTS.find((p) => p.id === match[1]) || MOCK_PROJECTS[0];
          return Promise.resolve({ data: found, status: 200, headers: {}, config: originalRequest });
        }
        return Promise.resolve({ data: MOCK_PROJECTS, status: 200, headers: {}, config: originalRequest });
      }

      if (url.includes('/tasks')) {
        const allTasks = MOCK_PROJECTS.flatMap((p) => p.tasks);
        return Promise.resolve({ data: allTasks, status: 200, headers: {}, config: originalRequest });
      }

      if (url.includes('/users')) {
        const allUsers = [
          { id: 'admin-id', full_name: 'Elena Rostova (Admin)', email: 'admin@acme.com', role: 'ADMIN', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
          { id: 'user-alex', full_name: 'Alex Rivera', email: 'alex@acme.com', role: 'USER', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        ];
        return Promise.resolve({ data: allUsers, status: 200, headers: {}, config: originalRequest });
      }
    }

    return Promise.reject(error);
  }
);
