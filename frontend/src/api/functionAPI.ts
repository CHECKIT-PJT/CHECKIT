import axiosInstance from './axiosInstance';
import useFunctionalSpecStore from '../stores/functionStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FunctionalSpec } from '../stores/functionStore';
import { useState } from 'react';

// 기능 명세서 목록 조회
export const useGetFunctionalSpecs = (projectId: number) => {
  const { setSpecs, setLoading, setError } = useFunctionalSpecStore();
  const [hasError, setHasError] = useState(false);

  return useQuery({
    queryKey: ['functionalSpecs', projectId],
    queryFn: async () => {
      if (!projectId || hasError) return [];
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/api/functional-spec/${projectId}`
        );
        const data = res.data.result;
        setSpecs(data);
        console.log('data', data);
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) setHasError(true);
        setError(err.response?.data?.message || '기능 명세 조회 실패');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!projectId && !hasError,
  });
};

// 기능 명세서 생성
export const useCreateFunctionalSpec = () => {
  const queryClient = useQueryClient();
  const { addSpec, setLoading, setError } = useFunctionalSpecStore();

  return useMutation({
    mutationFn: async (data: Omit<FunctionalSpec, 'id' | 'userName'>) => {
      setLoading(true);
      console.log('data', data);
      try {
        const res = await axiosInstance.post('/api/functional-spec', data);
        console.log('res', res);
        return res.data.result;
      } catch (err: any) {
        setError(err.response?.data?.message || '기능 명세서 생성 실패');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (createdSpec, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['functionalSpecs', variables.projectId],
      });
      addSpec(createdSpec);
    },
  });
};

// 기능 명세서 수정
export const useUpdateFunctionalSpec = () => {
  const queryClient = useQueryClient();
  const { updateSpec, setLoading, setError } = useFunctionalSpecStore();

  return useMutation({
    mutationFn: async (data: FunctionalSpec) => {
      setLoading(true);
      try {
        await axiosInstance.put('/api/functional-spec', data);
        return data;
      } catch (err: any) {
        setError(err.response?.data?.message || '기능 명세서 수정 실패');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: updated => {
      queryClient.invalidateQueries({
        queryKey: ['functionalSpecs', updated.projectId],
      });
      updateSpec(updated);
    },
  });
};

// 기능 명세서 삭제
export const useDeleteFunctionalSpec = () => {
  const queryClient = useQueryClient();
  const { deleteSpec, setLoading, setError } = useFunctionalSpecStore();

  return useMutation({
    mutationFn: async (specId: number) => {
      setLoading(true);
      try {
        await axiosInstance.delete(`/api/functional-spec/${specId}`);
        return specId;
      } catch (err: any) {
        setError(err.response?.data?.message || '기능 명세서 삭제 실패');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: specId => {
      queryClient.invalidateQueries({ queryKey: ['functionalSpecs'] });
      deleteSpec(specId);
    },
  });
};
