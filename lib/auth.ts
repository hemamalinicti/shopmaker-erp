import * as bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'shopmaster_session';
const JWT_SECRET = process.env.SESSION_SECRET || 'shopmaster_secret_key_2026_super_secure';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/**
 * Hashes a raw password securely using bcryptjs.
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compares a plain password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a signed session token.
 */
export function createSessionToken(payload: UserSession): string {
  const data = JSON.stringify(payload);
  const base64Data = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(base64Data)
    .digest('base64url');
  return `${base64Data}.${signature}`;
}

/**
 * Verifies and parses a session token.
 */
export function verifySessionToken(token: string): UserSession | null {
  try {
    const [base64Data, signature] = token.split('.');
    if (!base64Data || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(base64Data)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const data = Buffer.from(base64Data, 'base64url').toString('utf-8');
    return JSON.parse(data) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Server Action / Auth helper to log in a user and set cookie.
 */
export async function loginUser(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const sessionPayload: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = createSessionToken(sessionPayload);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error('Error logging in user:', error);
    return {
      success: false,
      error: error?.message || 'Authentication failed. Please try again.',
    };
  }
}

/**
 * Server Action / Auth helper to log out user.
 */
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch (err) {
    console.error('Error deleting cookie:', err);
  }
  return { success: true };
}

/**
 * Retrieves the current authenticated user session from cookie.
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    return verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Enforces role-based authorization for Server Actions.
 * Throws an Error if unauthorized.
 */
export async function requireRole(allowedRoles: Role[]): Promise<UserSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized. Please log in.');
  }

  if (!allowedRoles.includes(session.role)) {
    throw new Error(`Forbidden. Action requires ${allowedRoles.join(' or ')} permission.`);
  }

  return session;
}
