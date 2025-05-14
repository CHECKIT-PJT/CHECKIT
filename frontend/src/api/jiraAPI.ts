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

// 프로젝트에 등록된 Jira 정보 조회
export const getJiraProjectInfo = async (projectId: number) => {
  try {
    const response = await axiosInstance.get(`/api/project/${projectId}/jira`);
    return response.data.result;
  } catch (error) {
    console.error('프로젝트의 Jira 정보 조회 실패:', error);
    throw error;
  }
};

// Jira에 이슈 등록
export const createJiraIssue = async (projectId: number) => {
  try {
    const response = await axiosInstance.post(
      `/api/project/${projectId}/jira/issues`
    );
    return response.data.result.jiraLink;
  } catch (error) {
    console.error('Jira 이슈 등록 실패:', error);
    throw error;
  }
};
