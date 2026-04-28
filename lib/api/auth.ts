import { apiFetch } from './client';

export type UserRole = 'INDIVIDUAL' | 'COMPANY' | (string & {});

export interface RegisterUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: UserRole;
}

export interface RegisterUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role?: UserRole;
  message?: string;
  [key: string]: unknown;
}

export const registerUser = async ({ role, ...body }: RegisterUserInput) => {
  const payload: Record<string, unknown> = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phoneNumber: body.phoneNumber,
    password: body.password,
  };
  if (role) payload.role = role;
  return apiFetch<RegisterUserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  user?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export const loginUser = async (body: LoginUserInput) =>
  apiFetch<LoginUserResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

export const logout = async () =>
  apiFetch<void>('/auth/logout', { method: 'POST' });

export interface PasswordResetRequestResponse { message: string; }
export const requestPasswordReset = async (email: string) =>
  apiFetch<PasswordResetRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export interface ResetPasswordInput { token: string; newPassword: string; }
export interface ResetPasswordResponse { message: string; }
export const resetPassword = async (body: ResetPasswordInput) =>
  apiFetch<ResetPasswordResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const resendEmailConfirmation = async (email: string) =>
  apiFetch<{ message: string }>('/auth/resend-email-confirmation', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
