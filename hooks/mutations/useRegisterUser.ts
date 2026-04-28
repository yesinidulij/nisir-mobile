import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { registerUser, RegisterUserInput, RegisterUserResponse } from '@/lib/api/auth';
import { persistAuthResponse } from '@/lib/auth/storage';

export const useRegisterUser = (
  options?: UseMutationOptions<RegisterUserResponse, unknown, RegisterUserInput>,
) => {
  const { onSuccess, ...restOptions } = options ?? {};
  return useMutation<RegisterUserResponse, unknown, RegisterUserInput>({
    mutationFn: registerUser,
    onSuccess: async (data, variables, context) => {
      await persistAuthResponse(data);
      onSuccess?.(data, variables, context);
    },
    ...restOptions,
  });
};
