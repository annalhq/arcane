import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const TOKEN_NAME = 'auth_token';
const TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

// Server-side authentication check
export function isAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_NAME);
    return !!token;
  } catch (error) {
    // If cookies() is called outside of a request context, return false
    return false;
  }
}

export function authenticate(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment variables');
    return false;
  }
  
  return password === adminPassword;
}

export function setAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, 'authenticated', { 
    expires: new Date(Date.now() + TOKEN_EXPIRY),
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
}

export function clearAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(TOKEN_NAME);
}

export function requireAuth() {
  try {
    if (!isAuthenticated()) {
      redirect('/login');
    }
  } catch (error) {
    // If cookies() is called outside of a request context, redirect to login
    redirect('/login');
  }
}