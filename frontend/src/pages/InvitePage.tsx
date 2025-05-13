import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvite } from '../api/projectAPI';
import { AxiosError } from 'axios';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('inviteCode');
  const { mutate: acceptInvite, isError, error, isSuccess } = useAcceptInvite();

  // '이미 참여함'인 경우도 성공으로 간주
  const isAlreadyParticipated =
    isError && (error as AxiosError)?.response?.status === 400;

  useEffect(() => {
    if (inviteCode) {
      acceptInvite(inviteCode, {
        onSuccess: () => {
          console.log('초대 수락 성공');
        },
        onError: (error: Error) => {
          const err = error as AxiosError;
          if (err.response?.status === 400) {
            console.log('이미 참여한 사용자로 간주');
          } else {
            console.error('초대 수락 실패');
          }
        },
      });
    }
  }, [inviteCode, acceptInvite, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
        {isSuccess || isAlreadyParticipated ? (
          <>
            <h2 className="text-xl font-semibold text-green-600">
              참여 요청 완료
            </h2>
            <p className="text-sm text-gray-700">
              팀장이 승인하면 <br />
              프로젝트 목록에서 확인할 수 있습니다.
            </p>
            <button
              onClick={() => navigate('/project')}
              className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-200 shadow"
            >
              main으로 이동
            </button>
          </>
        ) : isError ? (
          <>
            <h2 className="text-xl font-semibold text-red-500">
              초대 수락 실패
            </h2>
            <p className="text-sm text-gray-700">
              초대 수락에 실패했습니다. 로그인이 필요합니다.
            </p>
            <button
              onClick={() =>
                navigate('/', {
                  state: { from: '/invite?inviteCode=' + inviteCode },
                })
              }
              className="w-full px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition duration-200 shadow"
            >
              로그인하기
            </button>
          </>
        ) : (
          <p className="text-gray-600 text-sm">처리 중...</p>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
