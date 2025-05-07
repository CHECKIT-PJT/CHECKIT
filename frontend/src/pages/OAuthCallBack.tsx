// src/pages/GitLabCallback.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthCallback } from '../api/authAPI';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    console.log('code', code);
    if (!code) {
      navigate('/?error=missing_code');
      return;
    }

    handleAuthCallback(code).then(success => {
      if (success) {
        console.log('success');
        navigate('/project');
      } else {
        navigate('/?error=invalid_token');
      }
    });
  }, [navigate]);

  return <div>GitLab 로그인 처리 중입니다...</div>;
};

export default OAuthCallback;
