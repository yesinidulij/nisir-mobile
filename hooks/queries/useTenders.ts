import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
  fetchSavedTenders,
  fetchTenderById,
  fetchTenders,
  TenderDetail,
  TenderListParams,
  TenderSummary,
} from '@/lib/api/tenders';

export const TENDERS_QUERY_KEY = 'tenders';

export const tenderListQueryKey = (params: TenderListParams) => [TENDERS_QUERY_KEY, 'list', params];
export const tenderDetailQueryKey = (id: string) => [TENDERS_QUERY_KEY, 'detail', id];

export const useTenders = <TData = TenderSummary[]>(
  params: TenderListParams,
  options?: Omit<UseQueryOptions<TenderSummary[], unknown, TData>, 'queryKey'>,
) =>
  useQuery<TenderSummary[], unknown, TData>({
    queryKey: tenderListQueryKey(params),
    queryFn: () => fetchTenders(params),
    ...options,
  });

export const useSavedTenders = <TData = TenderSummary[]>(
  params: TenderListParams,
  options?: Omit<UseQueryOptions<TenderSummary[], unknown, TData>, 'queryKey'>,
) =>
  useQuery<TenderSummary[], unknown, TData>({
    queryKey: ['saved-tenders', params],
    queryFn: () => fetchSavedTenders(params),
    ...options,
  });

export const useTender = <TData = TenderDetail>(
  id: string | undefined,
  options?: Omit<UseQueryOptions<TenderDetail, unknown, TData>, 'queryKey'>,
) =>
  useQuery<TenderDetail, unknown, TData>({
    queryKey: id ? tenderDetailQueryKey(id) : [TENDERS_QUERY_KEY, 'detail', '__undefined__'],
    queryFn: () => {
      if (!id) throw new Error('Missing tender id');
      return fetchTenderById(id);
    },
    enabled: Boolean(id),
    ...options,
  });
