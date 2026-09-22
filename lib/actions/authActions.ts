'use server';

import { loginUser as loginUserAuth, logoutUser as logoutUserAuth } from '@/lib/auth';

export async function loginAction(email: string, password: string) {
  return loginUserAuth(email, password);
}

export async function logoutAction() {
  return logoutUserAuth();
}
