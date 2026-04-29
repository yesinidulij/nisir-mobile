import { apiFetch, buildQueryString } from './client';

export type TenderStatus = 'DRAFT' | 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | (string & {});

export enum ApprovalStatus {
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface TenderCategory {
  id: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenderRequirement {
  id: string;
  content: string;
  order: number;
}

export interface TenderSpecification {
  id: string;
  content: string;
  order: number;
}

export interface TenderDocument {
  id: string;
  fileUrl: string;
  fileName: string;
  type?: string | null;
}

export interface TenderAttachment {
  id: string;
  fileUrl: string;
  fileType?: string | null;
}

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  company?: any;
}

export interface TenderSummary {
  id: string;
  title: string;
  summary?: string;
  description: string;
  categoryId: string;
  category: TenderCategory;
  location: string;
  comment?: string;
  deadline: Date;
  publishedAt?: Date;
  closedAt?: string | Date | null;
  status: TenderStatus;
  approvalStatus: ApprovalStatus;
  createdBy: User;
  createdById: string;
  companyName?: string;
  companyWebsite?: string;
  companyLogo?: string;
  createdAt: Date;
  updatedAt: Date;
  requirements?: TenderRequirement[];
  specifications?: TenderSpecification[];
  documents?: TenderDocument[];
  isSaved?: boolean;
}

export interface TenderDetail extends TenderSummary {
  documents?: TenderDocument[];
  attachments?: TenderAttachment[];
  requirements?: TenderRequirement[];
  specifications?: TenderSpecification[];
  closedAt?: string | null;
  contactName?: string | null;
  contactTitle?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export interface TenderListParams {
  search?: string;
  category?: string;
  location?: string;
  status?: TenderStatus;
  sort?: string;
  limit?: number;
  page?: number;
}

type TenderListResponse = TenderSummary[] | { data?: unknown; items?: unknown; results?: unknown; tenders?: unknown; [key: string]: unknown; };
type TenderDetailResponse = TenderDetail | { data?: unknown; tender?: unknown; result?: unknown; item?: unknown; [key: string]: unknown; };

const LIST_CANDIDATE_KEYS = ['data', 'items', 'results', 'tenders'] as const;
const DETAIL_CANDIDATE_KEYS = ['data', 'tender', 'result', 'item'] as const;

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

const isTenderArray = (value: unknown): value is TenderSummary[] => Array.isArray(value);
const isTenderDetail = (value: unknown): value is TenderDetail => Boolean(value && typeof value === 'object' && 'id' in value);
const toTenderArray = (response: TenderListResponse): TenderSummary[] => findNestedValue(response, isTenderArray, LIST_CANDIDATE_KEYS) ?? [];
const toTenderDetail = (response: TenderDetailResponse): TenderDetail => {
  const tender = findNestedValue(response, isTenderDetail, DETAIL_CANDIDATE_KEYS);
  if (!tender) throw new Error('Unable to parse tender response');
  return tender;
};

export const fetchTenders = async (params: TenderListParams = {}): Promise<TenderSummary[]> => {
  const queryString = buildQueryString(params as Record<string, unknown>);
  const response = await apiFetch<TenderListResponse>(`/tender${queryString}`);
  return toTenderArray(response);
};

export const fetchSavedTenders = async (params: TenderListParams = {}): Promise<TenderSummary[]> => {
  const queryString = buildQueryString(params as Record<string, unknown>);
  const response = await apiFetch<TenderListResponse>(`/tender/saved-tenders${queryString}`);
  return toTenderArray(response);
};

export const fetchTenderById = async (id: string): Promise<TenderDetail> => {
  const response = await apiFetch<TenderDetailResponse>(`/tender/${id}`);
  return toTenderDetail(response);
};

export async function saveTenderApi(id: string): Promise<void> {
  await apiFetch(`/tender/save/${encodeURIComponent(id)}`, { method: 'PUT' });
}

export async function unsaveTenderApi(id: string): Promise<void> {
  await apiFetch(`/tender/save/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
