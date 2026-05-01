import { apiFetch } from './client';

export interface CreateContactMessageInput {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createContactMessage(data: CreateContactMessageInput): Promise<ContactMessageResponse> {
  return apiFetch<ContactMessageResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
