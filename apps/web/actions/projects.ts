'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { randomBytes, randomUUID } from 'crypto';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { projects, users } from '@trace/db';

async function ensureUser() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? '';

  await db.insert(users).values({ id: userId, email }).onConflictDoNothing();

  return userId;
}

export async function createProject(formData: FormData) {
  const userId = await ensureUser();

  const name = (formData.get('name') as string)?.trim();
  const domain = (formData.get('domain') as string)?.trim() || null;

  if (!name) throw new Error('Project name is required');

  const id = randomUUID();
  const apiKey = 'pk_' + randomBytes(20).toString('hex');

  await db.insert(projects).values({ id, userId, name, domain, apiKey });

  redirect(`/projects/${id}`);
}

export async function getProjects() {
  const { userId } = await auth();
  if (!userId) return [];

  try {
    return await db.select().from(projects).where(eq(projects.userId, userId));
  } catch (err) {
    console.error('[getProjects] DB query failed — have you run drizzle-kit push?', err);
    return [];
  }
}

export async function getProject(id: string) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (!project || project.userId !== userId) redirect('/dashboard');

  return project;
}

export async function deleteProject(id: string) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));

  if (!project || project.userId !== userId) return;

  await db.delete(projects).where(eq(projects.id, id));

  redirect('/dashboard');
}
