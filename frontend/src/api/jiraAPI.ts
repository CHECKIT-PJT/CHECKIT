import axiosInstance from './axiosInstance';

// Jira 프로젝트 연동
export const linkJiraProject = async (
  projectId: string,
  projectKey: string,
  projectName: string,
  projectTypeKey: string
) => {
  try {
    const response = await axiosInstance.put(`/api/project/${projectId}/jira`, {
      projectId,
      projectKey,
      projectName,
      projectTypeKey,
    });

    return response.data;
  } catch (error) {
    console.error('Jira 프로젝트 연동 실패:', error);
    throw error;
  }
};

// Jira 연동 여부 조회
export const checkJiraLinked = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/jira/linked');

    return response.data.result;
  } catch (error) {
    console.error('Jira 연동 여부 조회 실패:', error);
    throw error;
  }
};

// Jira 프로젝트 리스트 조회
export const getJiraProjectList = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/jira/projects');

    return response.data.result;
  } catch (error) {
    console.error('Jira 프로젝트 리스트 조회 실패:', error);
    throw error;
  }
};
