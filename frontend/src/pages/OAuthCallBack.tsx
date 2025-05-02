// src/pages/GitLabCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../api/authAPI';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    console.log('code', code);
    if (!code) {
      navigate('/?error=missing_code');
      return;
    }

    handleAuthCallback('gitlab', code)
      .then(success => {
        if (success) {
          navigate('/'); // 로그인 성공 시
        } else {
          navigate('/?error=invalid_token');
        }
      })
      .catch(() => {
        navigate('/?error=login_failed');
      });
  }, [navigate]);

  return <div>GitLab 로그인 처리 중입니다...</div>;
};

export default OAuthCallback;
