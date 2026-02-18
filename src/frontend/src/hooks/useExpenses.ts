import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { ExpenseRecord, PresentbinTransaction, ImportSummary } from '../backend';

export function useGetExpenseRecords() {
  const { actor, isFetching } = useActor();

  return useQuery<ExpenseRecord[]>({
    queryKey: ['expenseRecords'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getExpenseRecords();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddExpenseRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      amount: number;
      currency: string;
      category: string;
      note: string;
      transactionDateTime: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addExpenseRecord(
        params.amount,
        params.currency,
        params.category,
        params.note,
        params.transactionDateTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseRecords'] });
    },
  });
}

export function useDeleteExpenseRecord() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteExpenseRecord(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseRecords'] });
    },
  });
}

export function useImportPresentbinTransactions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation<ImportSummary, Error, PresentbinTransaction[]>({
    mutationFn: async (transactions: PresentbinTransaction[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.importPresentbinTransactions(transactions);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseRecords'] });
    },
  });
}

