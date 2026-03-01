'use server';

import { authServer } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await authServer.signIn.email({ email, password });
  if (error) return { error: error.message };

  redirect('/tasks');
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  const { error } = await authServer.signUp.email({ email, password, name });
  if (error) return { error: error.message };

  redirect('/tasks');
}

export async function signOut() {
  await authServer.signOut();
  redirect('/sign-in');
}
