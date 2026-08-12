# 🚀 Acme Flow — Enterprise Project & Task Management System

A production-grade, full-stack corporate SaaS application designed with a modern **Linear / Stripe aesthetic**. Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, and **Prisma ORM**.

---

## 🌟 Key Features & Highlights

- **📊 Executive Dashboard**: High-level portfolio analytics, task completion velocity graphs, and priority breakdowns.
- **📋 Interactive Kanban Board**: Real-time drag-and-drop task status transitions (`TODO`, `IN_PROGRESS`, `DONE`) with celebration animations.
- **☀️ Dual Theme Engine**: Full Light Mode & Dark Mode support with HSL color tokens (`#0F172A` Slate Navy, Sky Blue, Pure White).
- **📄 Executive PDF Report Generator**: One-click download/print corporate PDF reports for project summary and portfolio analytics.
- **⌘ Command Palette**: Global search modal (`Cmd + K` / `Ctrl + K`) to instantly search projects, tasks, or navigate views.
- **🛡️ Role-Based Access Control (RBAC)**: Strict permission enforcement separating **ADMIN** and **USER** roles at both the API middleware and UI levels.
- **📱 Fully Responsive Mobile Design**: Slide-over mobile drawer navigation and fluid grid stacking across all device breakpoints.

---

## 🔐 Role-Based Access Control (RBAC) Matrix

The system implements a strict Role-Based Access Control model enforced by backend JWT security middleware (`requireRole` and `requireProjectMember`).

| Feature / Access Right | 🛡️ ADMIN (Administrator) | 👤 USER (Standard Member) |
| :--- | :--- | :--- |
| **Project Visibility** | **Global Portfolio Access**: Sees **ALL** corporate projects across the organization. | **Scoped Workspace Access**: Sees **ONLY** projects they own or have been explicitly added to as a team member. |
| **Project Control** | Can view, edit, manage team members, or delete **any** project. | Can manage or delete projects **they created/own**. Access to unjoined projects returns `HTTP 403 Forbidden`. |
| **User Directory (`/api/users`)** | **Exclusive Access**: Can list all system users to invite team members to projects. | **Blocked**: Attempts to access `/api/users` return `HTTP 403 Forbidden`. |
| **Task Management** | Full CRUD access across **all** project task boards. | Full CRUD access within **their accessible** project task boards. |
| **Team Roster Management** | Can add/remove members from **any** project. | Can add/remove members from projects **they own**. |
| **UI Role Badges** | Displays **`Admin Access`** badge in Header & Sidebar. | Displays standard user profile avatar & standard member badge. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS + Tailwind CSS (Custom Dark/Light Theme System)
- **UI Components & Icons**: Lucide React Icons
- **Animations**: Framer Motion
- **Notifications**: Sonner Toast Engine

### Backend
- **Server**: Node.js + Express.js REST API
- **Language**: TypeScript (`ts-node-dev`)
- **Database ORM**: Prisma ORM (SQLite for local dev, PostgreSQL production-ready)
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs` password hashing
- **Validation**: Zod schema validation

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher

---

### 1️⃣ Installation & Database Setup

1. **Clone or Open Project Directory**:
   ```bash
   cd c:\Users\theva\Desktop\Task
   ```

2. **Install Monorepo Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Initialize Database & Seed Sample Data**:
   ```bash
   cd ../backend
   npx prisma db push
   npm run seed
   ```

---

### 2️⃣ Running the Application

You can run both servers using root monorepo scripts or individual commands:

#### Option A: Running from Project Root (Recommended)

- **Start Backend API Server**:
  ```bash
  npm run dev:backend
  ```
- **Start Frontend Next.js Server**:
  ```bash
  npm run dev:frontend
  ```

#### Option B: Running Individual Folders Directly

- **Backend API Server**:
  ```bash
  cd backend
  npm run dev
  ```
  *(Runs on **`http://localhost:5000`**)*

- **Frontend Next.js Web App**:
  ```bash
  cd frontend
  npm run dev
  ```
  *(Runs on **`http://localhost:3000`**)*

---

## 🔑 One-Click Demo Credentials

You can use the **One-Click Demo Access** buttons on the Login page (`/auth/login`) or sign in manually with these credentials:

| Role | Email | Password | Permissions Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@acme.com` | `Password123!` | Global access to all projects, user directory & tasks |
| **User** | `alex@acme.com` | `Password123!` | Scoped access to Alex's assigned projects |

---

## 📡 API Reference Overview

### Auth Routes (`/api/auth`)
- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Authenticate user and issue JWT token
- `GET /api/auth/me` — Get current logged-in user profile

### Project Routes (`/api/projects`)
- `GET /api/projects` — List projects (Role-scoped for User, Global for Admin)
- `POST /api/projects` — Create a new project
- `GET /api/projects/:id` — Get project details, roster, and tasks
- `DELETE /api/projects/:id` — Delete project (Owner or Admin)
- `POST /api/projects/:id/members` — Add a team member
- `DELETE /api/projects/:id/members/:userId` — Remove a team member

### Task Routes (`/api/tasks` & `/api/projects/:id/tasks`)
- `GET /api/tasks` — List portfolio tasks for Executive Dashboard
- `GET /api/projects/:id/tasks` — List tasks for a specific project
- `POST /api/projects/:id/tasks` — Create a task
- `PUT /api/tasks/:id` — Update task status (`TODO`, `IN_PROGRESS`, `DONE`), priority, or assignee
- `DELETE /api/tasks/:id` — Delete a task

### User Routes (`/api/users`)
- `GET /api/users` — List all registered system users (**Admin Only**)
- `PUT /api/users/me` — Update personal profile details & avatar

---

## 🗄️ Database Schema Diagram (Prisma ORM)

```prisma
model User {
  id            String          @id @default(uuid())
  email         String          @unique
  password_hash String
  full_name     String
  avatar_url    String?
  role          String          @default("USER") // ADMIN | USER
  ownedProjects Project[]       @relation("ProjectOwner")
  memberships   ProjectMember[]
  tasks         Task[]          @relation("TaskAssignee")
}

model Project {
  id          String          @id @default(uuid())
  name        String
  description String?
  owner_id    String
  owner       User            @relation("ProjectOwner", fields: [owner_id], references: [id])
  members     ProjectMember[]
  tasks       Task[]
}

model ProjectMember {
  id         String   @id @default(uuid())
  project_id String
  user_id    String
  role       String   @default("MEMBER") // OWNER | MEMBER | VIEWER
  project    Project  @relation(fields: [project_id], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
}

model Task {
  id          String    @id @default(uuid())
  project_id  String
  title       String
  description String?
  status      String    @default("TODO") // TODO | IN_PROGRESS | DONE
  priority    String    @default("MEDIUM") // LOW | MEDIUM | HIGH
  assignee_id String?
  project     Project   @relation(fields: [project_id], references: [id], onDelete: Cascade)
  assignee    User?     @relation("TaskAssignee", fields: [assignee_id], references: [id])
}
```

---

## 📄 License & Author

Designed & developed as a production-grade enterprise application.
