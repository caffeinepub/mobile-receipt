import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBills, getBillItems } from '@/storage/repositories';

export function useLocalBills() {
  const queryClient = useQueryClient();

  const billsQuery = useQuery({
    queryKey: ['bills'],
    queryFn: getBills,
  });

  const billItemsQuery = useQuery({
    queryKey: ['billItems'],
    queryFn: getBillItems,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['billItems'] });
  };

  return {
    bills: billsQuery.data || [],
    billItems: billItemsQuery.data || [],
    isLoading: billsQuery.isLoading || billItemsQuery.isLoading,
    invalidate,
  };
}
