import axiosInstance from './axiosInstance';
import useApiStore from '../stores/apiStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiDocListItem, ApiSpecRequest } from '../types/apiDocs';
import { useState } from 'react';

// API 명세서 목록 조회
export const useGetApiSpecs = (projectId: number) => {
  const { setApiList, setLoading, setError } = useApiStore();
  const [hasError, setHasError] = useState(false);

  return useQuery({
    queryKey: ['apiSpecs', projectId],
    queryFn: async () => {
      if (!projectId || hasError) {
        return [];
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/api-spec/${projectId}`);

        if (response.data && response.data.result) {
          const apiList = response.data.result.map((api: any) => ({
            ...api,
            apiSpecId: api.id,
          }));
          setApiList(apiList);
          return apiList;
        }

        return [];
      } catch (error: any) {
        if (error.response?.status === 404) {
          setHasError(true);
        }
        const errorMessage =
          error.response?.data?.message || '데이터를 불러오는데 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!projectId && !hasError, // projectId가 있고 에러가 없을 때만 쿼리 실행
  });
};

// API 명세서 상세 조회
export const useGetApiDetail = (projectId: number, id: number) => {
  const { setCurrentApiDetail, setLoading, setError } = useApiStore();

  return useQuery({
    queryKey: ['apiSpec', projectId, id],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/api-spec/${projectId}`);

        if (response.data && response.data.result) {
          const apiDetail = response.data.result.find(
            (api: any) => api.id === id,
          );

          if (apiDetail) {
            setCurrentApiDetail(apiDetail);
            return apiDetail;
          }

          throw new Error('API 명세서를 찾을 수 없습니다.');
        }

        throw new Error('데이터를 불러오는데 실패했습니다.');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          '오류가 발생했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!projectId && !!id,
  });
};

// API 명세서 생성
export const useCreateApiSpec = () => {
  const queryClient = useQueryClient();
  const { addApiSpec, setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: async ({
      projectId,
      apiSpec,
    }: {
      projectId: number;
      apiSpec: ApiSpecRequest;
    }) => {
      setLoading(true);
      try {
        const response = await axiosInstance.post(
          `/api/api-spec/${projectId}`,
          apiSpec,
        );

        console.log('Response:', response.data);
        return response.data;
      } catch (error: any) {
        console.error('Error details:', error.response?.data);
        const errorMessage =
          error.response?.data?.message || '명세서 생성/수정에 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (data, { projectId, apiSpec }) => {
      queryClient.invalidateQueries({ queryKey: ['apiSpecs', projectId] });

      if (data && data.id) {
        const newApiSpec: ApiDocListItem = {
          apiSpecId: data.id,
          apiName: apiSpec.apiName,
          endpoint: apiSpec.endpoint,
          method: apiSpec.method,
          category: apiSpec.category,
          description: apiSpec.description,
          header: apiSpec.header,
        };

        addApiSpec(newApiSpec);
      }
    },
  });
};

// API 명세서 삭제
export const useDeleteApiSpec = () => {
  const queryClient = useQueryClient();
  const { deleteApiSpec, setLoading, setError } = useApiStore();

  return useMutation({
    mutationFn: async ({
      projectId,
      apiSpecId,
    }: {
      projectId: number;
      apiSpecId: number;
    }) => {
      setLoading(true);
      try {
        const response = await axiosInstance.delete(
          `/api/api-spec/${projectId}/${apiSpecId}`,
        );

        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || '명세서 삭제에 실패했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (_, { projectId, apiSpecId }) => {
      // 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['apiSpecs', projectId] });

      // 상세 정보 캐시 제거
      queryClient.removeQueries({
        queryKey: ['apiSpec', projectId, apiSpecId],
      });

      // 스토어에서 삭제
      deleteApiSpec(apiSpecId);
    },
  });
};

// API 명세서 카테고리 목록 조회
export const useGetApiCategories = (projectId: number) => {
  const { setLoading, setError } = useApiStore();

  return useQuery({
    queryKey: ['apiCategories', projectId],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/api-spec/${projectId}/category`,
        );

        // 성공 시 문자열 배열 반환
        if (response.data?.result) {
          return response.data.result as string[];
        }

        throw new Error('카테고리 데이터를 찾을 수 없습니다.');
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          '카테고리 조회 중 오류가 발생했습니다.';
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!projectId,
  });
};
