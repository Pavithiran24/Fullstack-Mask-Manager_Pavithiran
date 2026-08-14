import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic In-Memory Mock Store for Live Vercel Preview & Offline Fallback
let MOCK_PROJECTS: any[] = [
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
    const method = (originalRequest.method || 'get').toLowerCase();
    const url = originalRequest.url || '';
    const isVercelHost = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

    // Handle 401 token refresh if on local server
    if (!isVercelHost && error.response?.status === 401 && !originalRequest._retry && !url.includes('/auth/login')) {
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
      // 1. PROJECT CREATION (POST /projects)
      if (method === 'post' && url.endsWith('/projects')) {
        let bodyData = {};
        try {
          bodyData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
        } catch (e) {}

        const newProj: any = {
          id: `proj-${Date.now()}`,
          name: (bodyData as any).name || 'New Project Workspace',
          description: (bodyData as any).description || '',
          owner_id: 'admin-id',
          stats: { total: 0, done: 0, in_progress: 0, todo: 0, progress: 0 },
          members: [
            { id: `m-${Date.now()}`, user_id: 'admin-id', role: 'OWNER', user: { id: 'admin-id', full_name: 'Elena Rostova', email: 'admin@acme.com', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' } }
          ],
          tasks: [],
        };
        MOCK_PROJECTS.unshift(newProj);
        return Promise.resolve({ data: newProj, status: 201, headers: {}, config: originalRequest });
      }

      // 2. TASK CREATION (POST /projects/:id/tasks)
      if (method === 'post' && url.includes('/projects/') && url.includes('/tasks')) {
        const match = url.match(/\/projects\/([^\/]+)\/tasks/);
        const projId = match ? match[1] : 'proj-1';
        let bodyData = {};
        try {
          bodyData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
        } catch (e) {}

        const newTask = {
          id: `t-${Date.now()}`,
          title: (bodyData as any).title || 'New Task Item',
          description: (bodyData as any).description || '',
          status: (bodyData as any).status || 'TODO',
          priority: (bodyData as any).priority || 'MEDIUM',
          assignee: { full_name: 'Elena Rostova', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
        };

        const targetProj = MOCK_PROJECTS.find((p) => p.id === projId) || MOCK_PROJECTS[0];
        targetProj.tasks.unshift(newTask);
        targetProj.stats.total += 1;
        if (newTask.status === 'DONE') targetProj.stats.done += 1;
        if (newTask.status === 'IN_PROGRESS') targetProj.stats.in_progress += 1;
        if (newTask.status === 'TODO') targetProj.stats.todo += 1;
        targetProj.stats.progress = Math.round((targetProj.stats.done / targetProj.stats.total) * 100);

        return Promise.resolve({ data: newTask, status: 201, headers: {}, config: originalRequest });
      }

      // 3. TASK UPDATE (PUT /tasks/:id)
      if (method === 'put' && url.includes('/tasks/')) {
        let bodyData = {};
        try {
          bodyData = typeof originalRequest.data === 'string' ? JSON.parse(originalRequest.data) : originalRequest.data;
        } catch (e) {}

        const taskId = url.split('/tasks/')[1];
        let foundTask: any = null;
        let foundProj: any = null;

        for (const p of MOCK_PROJECTS) {
          const t = p.tasks.find((tk: any) => tk.id === taskId);
          if (t) {
            foundTask = t;
            foundProj = p;
            break;
          }
        }

        if (foundTask) {
          if ((bodyData as any).status) foundTask.status = (bodyData as any).status;
          if ((bodyData as any).priority) foundTask.priority = (bodyData as any).priority;
          if (foundProj) {
            const done = foundProj.tasks.filter((tk: any) => tk.status === 'DONE').length;
            foundProj.stats.done = done;
            foundProj.stats.progress = Math.round((done / foundProj.tasks.length) * 100);
          }
        }
        return Promise.resolve({ data: foundTask || { id: taskId, status: 'DONE' }, status: 200, headers: {}, config: originalRequest });
      }

      // 4. TASK DELETE (DELETE /tasks/:id)
      if (method === 'delete' && url.includes('/tasks/')) {
        const taskId = url.split('/tasks/')[1];
        MOCK_PROJECTS.forEach((p) => {
          p.tasks = p.tasks.filter((tk: any) => tk.id !== taskId);
        });
        return Promise.resolve({ data: { message: 'Task deleted' }, status: 200, headers: {}, config: originalRequest });
      }

      // 5. PROJECT DELETE (DELETE /projects/:id)
      if (method === 'delete' && url.includes('/projects/')) {
        const projId = url.split('/projects/')[1];
        MOCK_PROJECTS = MOCK_PROJECTS.filter((p) => p.id !== projId);
        return Promise.resolve({ data: { message: 'Project deleted' }, status: 200, headers: {}, config: originalRequest });
      }

      // 6. GET PROJECTS
      if (url.includes('/projects')) {
        const match = url.match(/\/projects\/([^\/]+)/);
        if (match) {
          const found = MOCK_PROJECTS.find((p) => p.id === match[1]) || MOCK_PROJECTS[0];
          return Promise.resolve({ data: found, status: 200, headers: {}, config: originalRequest });
        }
        return Promise.resolve({ data: MOCK_PROJECTS, status: 200, headers: {}, config: originalRequest });
      }

      // 7. GET TASKS
      if (url.includes('/tasks')) {
        const allTasks = MOCK_PROJECTS.flatMap((p) => p.tasks);
        return Promise.resolve({ data: allTasks, status: 200, headers: {}, config: originalRequest });
      }

      // 8. GET USERS
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
