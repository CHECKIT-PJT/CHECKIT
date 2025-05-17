import axiosInstance from './axiosInstance';
import { useMutation } from '@tanstack/react-query';

interface GitlabProjectData {
  repoName: string;
  visibility: 'public' | 'private';
  message: string;
}

interface GitlabProjectResponse {
  root: string;
  branch: string;
  files: GitlabResultFiles[];
}

interface GitlabPushData {
  message: string;
  changedFiles: GitlabResultFiles[];
}

interface GitlabResultFiles {
  path: string;
  type: string;
  content: string | null;
}

export const useCreateGitlabProject = (
  projectId: number,
  data: GitlabProjectData
) => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await axiosInstance.post(
          `api/git/repository/${projectId}`,
          data
        );
        return response.data.result.repositoryUrl;
      } catch (error) {
        console.error('GitLab 프로젝트 생성 실패:', error);
        throw error;
      }
    },
    onSuccess: data => {
      console.log('GitLab 프로젝트 생성 성공:', data);
    },
    onError: error => {
      console.error('GitLab 프로젝트 생성 실패:', error);
    },
  });
};

export const useGitPull = (projectId: number) => {
  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.get(`api/git/pull/${projectId}`);
      console.log('response.data.result', response.data.result);
      return response.data.result;
    },
  });
};

export const useGitPush = (projectId: number) => {
  return useMutation({
    mutationFn: async (data: GitlabPushData) => {
      const response = await axiosInstance.post(
        `api/git/push/${projectId}`,
        data
      );
      return response.data.result;
    },
  });
};
