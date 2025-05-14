import axiosInstance from './axiosInstance';

// GitLab OAuth 리다이렉션
export const redirectToGitLabLogin = () => {
  const clientId = import.meta.env.VITE_GITLAB_CLIENT_ID;
  const redirectUri = 'https://checkit.my/gitlab/callback';
  const scope = 'read_user read_repository write_repository api';
  const encodedScope = encodeURIComponent(scope);
  const gitlabUrl = `https://lab.ssafy.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodedScope}`;

  window.location.href = gitlabUrl;
};

// Jira OAuth 리다이렉션
export const redirectToJiraLogin = () => {
  const clientId = import.meta.env.VITE_JIRA_CLIENT_ID;
  const redirectUri = 'https://checkit.my/jira/callback';
  const scope =
    'read:jira-work write:jira-work read:board-scope:jira-software read:project:jira read:jira-user offline_access';
  const authorizeUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&prompt=consent`;

  window.location.href = authorizeUrl;
};

// 인증 상태 확인
export const verifyToken = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/verify');
    return response.data.success;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
};

// 토큰 갱신
export const refreshToken = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/refresh');
    // sessionStorage에 토큰 저장
    if (response.data.data && response.data.data.accessToken) {
      sessionStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  try {
    await axiosInstance.post('/api/auth/logout');
  } catch (error: any) {
    console.error('Logout error:', error);
    // 401 에러인 경우 특별한 값 반환
    if (error.response?.status === 401) {
      return 'unauthorized';
    }
  } finally {
    // 서버 요청 성공/실패와 관계없이 토큰 제거
    sessionStorage.removeItem('accessToken');
    return true;
  }
};

export const handleAuthCallback = async (code: string): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/auth/gitlab/callback?code=${code}`,
      {
        withCredentials: true,
      }
    );
    console.log('response', response);
    const accessToken = response.data.result.accessToken;

    if (accessToken) {
      sessionStorage.setItem('accessToken', accessToken);
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};

export const handleJiraAuthCallback = async (
  code: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/auth/jira/callback?code=${code}`
    );

    const result = response.data?.result;
    if (result) {
      return true;
    }

    console.warn(
      'Jira 응답에 accessToken이 포함되어 있지 않습니다:',
      response.data
    );
    return false;
  } catch (error) {
    console.error('Jira 인증 콜백 처리 중 에러:', error);
    return false;
  }
};

// sessionStorage에서 토큰 가져오기
export const getToken = () => {
  return sessionStorage.getItem('accessToken');
};

export default {
  redirectToGitLabLogin,
  redirectToJiraLogin,
  handleAuthCallback,
  handleJiraAuthCallback,
  verifyToken,
  refreshToken,
  logout,
  getToken,
};
