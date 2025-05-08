import axiosInstance from './axiosInstance';
import useProjectStore from '../stores/projectStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Project {
  projectId: number;
  name: string;
  createdAt: string;
  description?: string;
  status?: string;
}

interface ProjectMember {
  userId: number;
  userName: string;
  nickname: string;
  userEmail: string;
  role: string;
}

interface ProjectDetail extends Project {
  updatedAt: string;
  projectMembers: ProjectMember[];
}

// 프로젝트 목록 조회
export const useGetProjects = () => {
  const { setProjects } = useProjectStore();
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/project');

      if (!response.data || !response.data.result) {
        throw new Error('No projects found');
      }
      setProjects(response.data.result);
      console.log(response.data.result);
      return response.data.result;
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// 프로젝트 상세 조회
export const useGetProjectById = (projectId: number) => {
  const { setCurrentProject } = useProjectStore();
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/project/${projectId}`);
      if (response.data) {
        setCurrentProject(response.data.result);
      }
      return response.data;
    },
  });
};

// 프로젝트 생성
export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (project: { projectName: string }) => {
      const response = await axiosInstance.post('/api/project', {
        projectName: project.projectName,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// 프로젝트 수정 (이름만 변경 가능 )
export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      projectData,
    }: {
      projectId: number;
      projectData: { projectName: string };
    }) => {
      const response = await axiosInstance.put(
        `/api/project/${projectId}`,
        projectData
      );
      return response.data;
    },
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};

// 프로젝트 떠나기
export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: number) => {
      const response = await axiosInstance.delete(
        `/api/project/${projectId}/leave`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// 프로젝트 멤버 추가
export const useAddProjectMember = () => {
  return useMutation({
    mutationFn: async ({
      projectId,
      emails,
    }: {
      projectId: number;
      emails: string[];
    }) => {
      const response = await axiosInstance.post(
        `/api/project/${projectId}/invitations`,
        emails
      );
      return response.data;
    },
  });
};

// 프로젝트 멤버 초대 링크 생성
export const useCreateInvitationLink = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: number) => {
      const response = await axiosInstance.post(
        `/api/project/${projectId}/invitations/link`
      );
      return response.data;
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
};
