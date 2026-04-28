import { apiFetch } from './client';

export type CompanyDocumentType = 'BUSINESS_LICENSE' | 'ID_CARD' | 'LETTER_OF_AUTHORITY' | (string & {});

export enum CompanyVerificationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface CompanyDocumentSummary {
  type: CompanyDocumentType;
  fileName: string;
  fileUrl: string;
}

export interface ProfileSummary {
  id?: string;
  name: string;
  userId?: string;
  website?: string | null;
  description?: string | null;
  industryCategory?: string;
  streetAddress?: string;
  city?: string;
  logo?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  verificationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | (string & {});
  documents?: CompanyDocumentSummary[];
  email?: string | null;
  phone?: string | null;
  createdAt: Date | string;
}

export interface ProfileDetail extends ProfileSummary {}

export interface VerificationStatusResponse {
  success: boolean;
  data: CompanyVerificationStatus;
  message?: string;
}

const DETAIL_CANDIDATE_KEYS = ['data', 'tender', 'result', 'item'] as const;

const isProfileDetail = (value: unknown): value is ProfileDetail =>
  Boolean(value && typeof value === 'object' && 'id' in value);

const findNestedValue = <T>(
  input: unknown,
  predicate: (value: unknown) => value is T,
  candidateKeys: readonly string[],
): T | undefined => {
  if (predicate(input)) return input;
  if (input && typeof input === 'object') {
    const record = input as Record<string, unknown>;
    for (const key of candidateKeys) {
      if (!(key in record)) continue;
      const nested = findNestedValue(record[key], predicate, candidateKeys);
      if (nested !== undefined) return nested;
    }
  }
  return undefined;
};

export const fetchProfile = async (): Promise<ProfileSummary> => {
  const response = await apiFetch<any>('/company/my-profile');
  const profile = findNestedValue(response, isProfileDetail, DETAIL_CANDIDATE_KEYS);
  if (!profile) throw new Error('Unable to parse profile response');
  return profile;
};

export const fetchCompanyVerificationStatus = async (): Promise<CompanyVerificationStatus> => {
  const response = await apiFetch<VerificationStatusResponse>('/company/check-verification-status');
  return response.data;
};
