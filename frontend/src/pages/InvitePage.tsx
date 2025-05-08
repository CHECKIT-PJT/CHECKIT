import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvite } from '../api/projectAPI';
import { AxiosError } from 'axios';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('inviteCode');
  const { mutate: acceptInvite, isError, error } = useAcceptInvite();

  useEffect(() => {
    if (inviteCode) {
      acceptInvite(inviteCode, {
        onSuccess: () => {
          console.log('초대 수락 성공');
        },
        onError: () => {
          console.error('초대 수락 실패');
        },
      });
    }
  }, [inviteCode, acceptInvite, navigate]);

  const getErrorMessage = () => {
    if ((error as AxiosError)?.response?.status === 400) {
      return '이미 프로젝트에 참여 요청을 했거나 가입한 상태입니다.';
    }
    return '초대 수락에 실패했습니다. 로그인이 필요합니다.';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="text-center">
        {isError ? (
          <div className="flex flex-col items-center gap-4">
            <div className="text-red-500">{getErrorMessage()}</div>
            <button
              onClick={() =>
                navigate(
                  (error as AxiosError)?.response?.status === 400
                    ? '/project'
                    : '/'
                )
              }
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {(error as AxiosError)?.response?.status === 400
                ? '프로젝트로 이동'
                : '로그인하기'}
            </button>
          </div>
        ) : (
          <>
            참여 요청을 보냈습니다. <br />
            팀장이 승인하면 프로젝트 목록에서 확인할 수 있습니다.
            <br />
            <button
              onClick={() => navigate('/project')}
              className="px-4 py-2 text-sm bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
            >
              main으로 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
