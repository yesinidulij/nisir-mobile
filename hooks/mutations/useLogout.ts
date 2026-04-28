import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { logout } from '@/lib/api/auth';
import { clearAuthState } from '@/lib/auth/storage';

export const useLogout = (
  options?: UseMutationOptions<void, unknown, void | undefined>,
) => {
  const { onSuccess, onError, ...restOptions } = options ?? {};
  return useMutation<void, unknown, void | undefined>({
    mutationFn: () => logout(),
    onSuccess: async (...args) => {
      await clearAuthState();
      onSuccess?.(...args);
    },
    onError: async (...args) => {
      await clearAuthState();
      onError?.(...args);
    },
    ...restOptions,
  });
};
