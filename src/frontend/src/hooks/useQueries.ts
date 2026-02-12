import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, Transaction, DepositRequest } from '../backend';
import { toast } from 'sonner';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
}

// Wallet Queries
export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['balance'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Deposit Request Queries
export function useGetUserDepositRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DepositRequest[]>({
    queryKey: ['userDepositRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Note: Backend currently only has getDepositRequests() for admins
      // This will need backend support for user-specific requests
      try {
        return await actor.getDepositRequests();
      } catch (error) {
        // If not admin, return empty array for now
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateDepositRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDepositRequest(amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userDepositRequests'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      toast.success('Deposit request created successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to create deposit request';
      toast.error(message.includes('Unauthorized') ? 'You must be logged in to create a deposit request' : message);
    },
  });
}

// Transaction Queries
export function useGetUserTransactions() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Transaction[]>({
    queryKey: ['userTransactions'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor not available');
      const principal = identity.getPrincipal();
      return actor.getUserTransactions(principal);
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

// Admin Queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllDepositRequests() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DepositRequest[]>({
    queryKey: ['allDepositRequests'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDepositRequests();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useApproveDepositRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveDepositRequest(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allDepositRequests'] });
      queryClient.invalidateQueries({ queryKey: ['userDepositRequests'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['userTransactions'] });
      toast.success('Deposit request approved successfully');
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to approve deposit request';
      toast.error(message.includes('Unauthorized') ? 'Only admins can approve deposits' : message);
    },
  });
}

export function useGetAllTransactions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transaction[]>({
    queryKey: ['allTransactions'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllTransactions();
    },
    enabled: !!actor && !actorFetching,
  });
}
