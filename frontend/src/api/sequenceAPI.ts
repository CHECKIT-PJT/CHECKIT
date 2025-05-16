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
  data: { content: string; diagramUrl: string; category: string },
) => {
  return axiosInstance.post(`/api/project/${projectId}/sequence`, data, {});
};

export const getSequenceDiagram = (projectId: number, category: string) => {
  return axiosInstance.get(`/api/project/${projectId}/sequence`, {
    params: { category },
  });
};

export const updateSequenceDiagram = (
  projectId: number,
  data: { content: string; diagramUrl: string; category: string },
) => {
  return axiosInstance.put(`/api/project/${projectId}/sequence`, data, {});
};

export const deleteSequenceDiagram = (projectId: number, category: string) => {
  return axiosInstance.delete(`/api/project/${projectId}/sequence`, {
    params: { category },
  });
};

export const downloadSequenceCode = (projectId: number, category: string) => {
  return axiosInstance.get(`/api/project/${projectId}/sequence/download/code`, {
    params: { category },
    responseType: 'blob',
  });
};

export const downloadSequenceImage = (projectId: number, category: string) => {
  return axiosInstance.get(
    `/api/project/${projectId}/sequence/download/image`,
    {
      params: { category },
      responseType: 'blob',
    },
  );
};
