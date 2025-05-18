import axiosInstance from './axiosInstance';

export const getDockerCompose = async (projectId: number) => {
  return await axiosInstance.get(`/api/project/${projectId}/docker-compose`);
};

export const createDockerCompose = async (
  projectId: number,
  databases: string[],
) => {
  return await axiosInstance.post(`/api/project/${projectId}/docker-compose`, {
    databases: [...databases], // 명시적 배열 전달
  });
};

export const updateDockerCompose = async (
  projectId: number,
  content: string,
) => {
  return await axiosInstance.put(`/api/project/${projectId}/docker-compose`, {
    content,
  });
};

export const deleteDockerCompose = async (projectId: number) => {
  return await axiosInstance.delete(`/api/project/${projectId}/docker-compose`);
};
