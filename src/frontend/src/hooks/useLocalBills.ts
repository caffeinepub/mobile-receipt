import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBills, getAllBillItems } from '@/storage/repositories';

export function useLocalBills() {
  const queryClient = useQueryClient();

  const billsQuery = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  });

  const billItemsQuery = useQuery({
    queryKey: ['billItems'],
    queryFn: getAllBillItems,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['billItems'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['items'] });
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  };

  return {
    bills: billsQuery.data || [],
    billItems: billItemsQuery.data || [],
    isLoading: billsQuery.isLoading || billItemsQuery.isLoading,
    invalidate,
  };
}
