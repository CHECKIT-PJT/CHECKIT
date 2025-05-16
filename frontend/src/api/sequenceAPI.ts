import axiosInstance from './axiosInstance';

export const generateSequenceDiagram = (
  projectId: number,
  category: string,
) => {
  return axiosInstance.post(
    `/api/project/${projectId}/sequence/generate`,
    null,
    {
      params: { category },
    },
  );
};

export const saveSequenceDiagram = (
  projectId: number,
  data: { content: string; diagramUrl: string },
) => {
  return axiosInstance.post(`/api/project/${projectId}/sequence`, data);
};

export const getSequenceDiagram = (projectId: number) => {
  return axiosInstance.get(`/api/project/${projectId}/sequence`);
};

export const updateSequenceDiagram = (
  projectId: number,
  data: { content: string; diagramUrl: string },
) => {
  return axiosInstance.put(`/api/project/${projectId}/sequence`, data);
};

export const deleteSequenceDiagram = (projectId: number) => {
  return axiosInstance.delete(`/api/project/${projectId}/sequence`);
};

export const downloadSequenceCode = (projectId: number) => {
  return axiosInstance.get(`/api/project/${projectId}/sequence/download/code`, {
    responseType: 'blob',
  });
};

export const downloadSequenceImage = (projectId: number) => {
  return axiosInstance.get(
    `/api/project/${projectId}/sequence/download/image`,
    {
      responseType: 'blob',
    },
  );
};
