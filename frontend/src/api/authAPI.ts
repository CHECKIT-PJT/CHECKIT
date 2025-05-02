import axiosInstance from './axiosInstance';

// GitLab OAuth 리다이렉션
export const redirectToGitLabLogin = () => {
  const clientId = import.meta.env.VITE_GITLAB_CLIENT_ID;
  const redirectUri = 'http://localhost:5173/gitlab/callback';
  const gitlabUrl = `https://lab.ssafy.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read_user`;

  window.location.href = gitlabUrl;
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
    // 로그아웃 시 sessionStorage에서 토큰 제거
    sessionStorage.removeItem('accessToken');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const handleAuthCallback = async (
  provider: 'gitlab',
  code: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/api/auth/${provider}/callback?code=${code}`,
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
    console.error(`${provider} callback error:`, error);
    return false;
  }
};

// sessionStorage에서 토큰 가져오기
export const getToken = () => {
  return sessionStorage.getItem('accessToken');
};

export default {
  redirectToGitLabLogin,
  handleAuthCallback,
  verifyToken,
  refreshToken,
  logout,
  getToken,
};
