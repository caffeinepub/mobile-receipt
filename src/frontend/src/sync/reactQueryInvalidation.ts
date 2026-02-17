import { QueryClient } from '@tanstack/react-query';

export function invalidateAllLocalData(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['bills'] });
  queryClient.invalidateQueries({ queryKey: ['billItems'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  queryClient.invalidateQueries({ queryKey: ['items'] });
  queryClient.invalidateQueries({ queryKey: ['settings'] });
}
