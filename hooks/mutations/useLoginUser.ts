import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { loginUser, LoginUserInput, LoginUserResponse } from '@/lib/api/auth';
import { persistAuthResponse } from '@/lib/auth/storage';

export const useLoginUser = (
  options?: UseMutationOptions<LoginUserResponse, unknown, LoginUserInput>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};
  return useMutation<LoginUserResponse, unknown, LoginUserInput>({
    mutationFn: loginUser,
    onSuccess: async (data, variables, context) => {
      await persistAuthResponse(data);
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
