import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAcceptInvite } from '../api/projectAPI';
import { AxiosError } from 'axios';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inviteCode = searchParams.get('inviteCode');
  const { mutate: acceptInvite, isError, error, isSuccess } = useAcceptInvite();

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white shadow-2xl rounded-3xl p-10 max-w-lg w-full text-center space-y-8 border border-gray-200">
        {isSuccess || isAlreadyParticipated ? (
          <>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-green-100 text-green-600 flex items-center justify-center rounded-full text-2xl font-bold shadow-inner">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-green-700">
                참여 요청 완료
              </h2>
              <p className="text-gray-600 text-sm">
                팀장이 승인하면
                <br />
                프로젝트 목록에서 확인할 수 있습니다.
              </p>
              <button
                onClick={() => navigate('/project')}
                className="w-full py-2 mt-4 text-white bg-green-600 hover:bg-green-500 rounded-xl transition duration-200 font-medium shadow"
              >
                main으로 이동
              </button>
            </div>
          </>
        ) : isError ? (
          <>
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 bg-red-100 text-red-600 flex items-center justify-center rounded-full text-3xl font-bold shadow-inner">
                !
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                초대 수락 실패
              </h2>
              <p className="text-gray-600 mb-10">
                초대 수락에 실패했습니다. <br />
                로그인이 필요합니다.
              </p>
              <button
                onClick={() =>
                  navigate('/', {
                    state: { from: '/invite?inviteCode=' + inviteCode },
                  })
                }
                className="w-full py-2 mt-4 text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition duration-200 font-medium shadow"
              >
                로그인하기
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-blue-300 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 text-sm">초대 수락 처리 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
