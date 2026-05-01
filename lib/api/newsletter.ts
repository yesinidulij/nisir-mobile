import { apiFetch } from './client';

export interface SubscribeToNewsletterInput {
  email: string;
}

export interface SubscribeToNewsletterResponse {
  message: string;
}

export async function subscribeToNewsletter(data: SubscribeToNewsletterInput): Promise<SubscribeToNewsletterResponse> {
  return apiFetch<SubscribeToNewsletterResponse>('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
