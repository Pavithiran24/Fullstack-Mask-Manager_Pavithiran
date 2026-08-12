import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing tables
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      password_hash: passwordHash,
      full_name: 'Elena Rostova (Admin)',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      role: 'ADMIN',
    },
  });

  const userAlex = await prisma.user.create({
    data: {
      email: 'alex@acme.com',
      password_hash: passwordHash,
      full_name: 'Alex Rivera',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
    },
  });

  const userSarah = await prisma.user.create({
    data: {
      email: 'sarah@acme.com',
      password_hash: passwordHash,
      full_name: 'Sarah Chen',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
    },
  });

  const userDavid = await prisma.user.create({
    data: {
      email: 'david@acme.com',
      password_hash: passwordHash,
      full_name: 'David Vance',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
    },
  });

  console.log('✅ Created 4 users');

  // Create Project 1: Enterprise Redesign v2
  const project1 = await prisma.project.create({
    data: {
      name: 'Enterprise Redesign v2',
      description: 'Overhaul corporate dashboard UI using Linear-inspired dark navy & sky blue themes with real-time analytics.',
      owner_id: adminUser.id,
      members: {
        create: [
          { user_id: adminUser.id, role: 'OWNER' },
          { user_id: userAlex.id, role: 'MEMBER' },
          { user_id: userSarah.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Helper helper
  function alexUser(id: string) { return id; }

  // Create Project 2: Mobile iOS & Android App
  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App v2.0',
      description: 'Cross-platform mobile application for offline task synchronization and instant push notifications.',
      owner_id: userSarah.id,
      members: {
        create: [
          { user_id: userSarah.id, role: 'OWNER' },
          { user_id: userAlex.id, role: 'MEMBER' },
          { user_id: userDavid.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Create Project 3: Cloud Infrastructure & DevOps
  const project3 = await prisma.project.create({
    data: {
      name: 'Cloud Infrastructure & DevOps',
      description: 'Migrate legacy microservices to Kubernetes clusters, automated CI/CD pipelines, and zero-trust security.',
      owner_id: userDavid.id,
      members: {
        create: [
          { user_id: userDavid.id, role: 'OWNER' },
          { user_id: adminUser.id, role: 'MEMBER' },
        ],
      },
    },
  });

  console.log('✅ Created 3 projects');

  // Tasks for Project 1 (Enterprise Redesign v2)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  await prisma.task.createMany({
    data: [
      {
        project_id: project1.id,
        title: 'Design Dark Blue & Light Blue Tailwind Tokens',
        description: 'Define core color variables (#0F172A, #1E293B, #38BDF8) and shadow elevation tokens.',
        status: 'DONE',
        priority: 'HIGH',
        assignee_id: adminUser.id,
        due_date: today,
      },
      {
        project_id: project1.id,
        title: 'Implement Cmd+K Command Palette Modal',
        description: 'Build fuzzy search modal for instant navigation across projects, tasks, and quick actions.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee_id: userAlex.id,
        due_date: nextWeek,
      },
      {
        project_id: project1.id,
        title: 'Interactive Drag and Drop Kanban Board',
        description: 'Connect HTML5 / dnd-kit drop zones with status update API triggers for TODO, IN_PROGRESS, and DONE.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee_id: userSarah.id,
        due_date: nextWeek,
      },
      {
        project_id: project1.id,
        title: 'Integrate Sonner Toast Notifications',
        description: 'Provide instant feedback toasts for creation, deletion, and error states across all forms.',
        status: 'TODO',
        priority: 'MEDIUM',
        assignee_id: adminUser.id,
        due_date: twoWeeks,
      },
      {
        project_id: project1.id,
        title: 'Audit Accessibility & Color Contrast',
        description: 'Verify WCAG AAA compliance for dark blue surfaces and sky blue text highlights.',
        status: 'TODO',
        priority: 'LOW',
        assignee_id: null,
        due_date: twoWeeks,
      },
    ],
  });

  // Tasks for Project 2 (Mobile App v2.0)
  await prisma.task.createMany({
    data: [
      {
        project_id: project2.id,
        title: 'Setup JWT Token Refresh Interceptor',
        description: 'Handle automatic silent token refresh via HTTP-only cookies on 401 response status.',
        status: 'DONE',
        priority: 'HIGH',
        assignee_id: userSarah.id,
        due_date: today,
      },
      {
        project_id: project2.id,
        title: 'Offline SQLite Data Caching',
        description: 'Cache active project state locally when device loses internet connectivity.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignee_id: userDavid.id,
        due_date: nextWeek,
      },
      {
        project_id: project2.id,
        title: 'Biometric FaceID Login Integration',
        description: 'Secure native authentication flow for iOS and Android devices.',
        status: 'TODO',
        priority: 'LOW',
        assignee_id: userAlex.id,
        due_date: twoWeeks,
      },
    ],
  });

  // Tasks for Project 3 (Cloud Infrastructure & DevOps)
  await prisma.task.createMany({
    data: [
      {
        project_id: project3.id,
        title: 'Provision Production PostgreSQL Cluster',
        description: 'Configure multi-region read replicas with automated backup policies.',
        status: 'DONE',
        priority: 'HIGH',
        assignee_id: userDavid.id,
        due_date: today,
      },
      {
        project_id: project3.id,
        title: 'Setup Docker Monorepo Build Matrix',
        description: 'Optimize multi-stage Dockerfiles for Next.js frontend and Express REST API.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        assignee_id: adminUser.id,
        due_date: nextWeek,
      },
    ],
  });

  console.log('✅ Created initial tasks for all projects');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
