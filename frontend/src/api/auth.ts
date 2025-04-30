/**
 * 환경 변수에서 API 기본 URL을 가져옵니다.
 * 기본값은 localhost로 설정되어 있습니다.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * GitLab 로그인 URL로 이동합니다 (302 리다이렉트).
 */
export const redirectToGitLabLogin = () => {
  window.location.href = `${BASE_URL}/api/auth/gitlab/login`;
};
