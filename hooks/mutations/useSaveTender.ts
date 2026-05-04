import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { saveTenderApi, unsaveTenderApi } from '@/lib/api/tenders';
import { TENDERS_QUERY_KEY, tenderDetailQueryKey } from '@/hooks/queries/useTenders';

type SaveTenderInput = {
  id: string;
  action: 'save' | 'unsave';
};

/**
 * Save or unsave a tender for the current user.
 *
 * Pass { id, action: "save" } to save or { id, action: "unsave" } to unsave.
 * Optimistic UI is handled by the calling component; this hook invalidates
 * query caches on settlement so lists/details stay fresh.
 */
export const useSaveTender = (
  options?: UseMutationOptions<void, unknown, SaveTenderInput>,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, SaveTenderInput>({
    mutationFn: async ({ id, action }: SaveTenderInput) => {
      if (action === 'save') {
        return saveTenderApi(id);
      } else {
        return unsaveTenderApi(id);
      }
    },

    onMutate: async () => {
      // Cancel any in-flight list queries to avoid stale overwrites
      await queryClient.cancelQueries({
        queryKey: [TENDERS_QUERY_KEY, 'list'],
      });
    },

    onError: (err, variables, ctx) => {
      (options as any)?.onError?.(err, variables, ctx);
    },

    onSuccess: (_data, variables, ctx) => {
      (options as any)?.onSuccess?.(_data, variables, ctx);
    },

    onSettled: (data, error, variables, ctx) => {
      // Refresh both the tender list and this tender's detail (if cached)
      queryClient.invalidateQueries({ queryKey: [TENDERS_QUERY_KEY, 'list'] });
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: tenderDetailQueryKey(variables.id) });
      }
      (options as any)?.onSettled?.(data, error, variables, ctx);
    },

    ...options,
  });
};
