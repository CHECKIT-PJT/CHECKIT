import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleJiraAuthCallback } from '../api/authAPI';
import { toast } from 'react-toastify';

const JiraAuthCallback = () => {
  const navigate = useNavigate();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (!code) {
      navigate('/project');
      toast.error('Jira 인증 실패');
      return;
    }

    handleJiraAuthCallback(code).then((success: boolean) => {
      if (success) {
        console.log('success');
        console.log(success);
        navigate('/project');
      } else {
        navigate('/project');
        toast.error('Jira 인증 실패');
      }
    });
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="flex flex-col items-center p-8 rounded-xl">
        <div className="relative w-24 h-24 mb-6">
          {/* Spinner ring */}
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-gray-300 animate-spin"></div>
        </div>

        <h2 className="text-2xl font-medium text-gray-700 mb-2">로그인 중</h2>
        <div className="flex space-x-1 mt-3">
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0s' }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default JiraAuthCallback;
