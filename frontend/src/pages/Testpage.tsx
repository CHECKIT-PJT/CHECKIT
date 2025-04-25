import { toast, ToastContainer } from 'react-toastify';
import StatusFilter from '../components/icon/StatusFilter';
import UserFilter from '../components/icon/UserFilter';
import ChapterCard from '../components/chapter/ChapterCard';
import ChapterCardLong from '../components/chapter/ChapterCardLong';
import ChapterSelect from '../components/chapter/ChapterSelect';
import { useNavigate } from 'react-router-dom';

function Testpage() {
  const notifySuccess = () => toast.success('성공했습니다!');
  const notifyError = () => toast.error('오류가 발생했습니다!');
  const notifyWarning = () => toast.warning('경고입니다!');
  const notifyInfo = () => toast.info('정보입니다!');
  const notifyDefault = () => toast('기본 알림입니다!');
  const navigate = useNavigate();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">h1 :Testpage</h1>
      <button
        onClick={() => navigate('/chapter/first')}
        className="bg-slate-200"
      >
        select
      </button>
      <h2 className="text-xl font-bold mb-4">버튼 테스트</h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={notifySuccess}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          성공 알림
        </button>
        <button
          onClick={notifyError}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          오류 알림
        </button>
        <button
          onClick={notifyWarning}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          경고 알림
        </button>
        <button
          onClick={notifyInfo}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          정보 알림
        </button>
        <button
          onClick={notifyDefault}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          기본 알림
        </button>
      </div>
      <ToastContainer theme="colored" />

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">상태 아이콘 테스트</h2>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <StatusFilter type="ongoing" />
            <span>진행중</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusFilter type="done" />
            <span>완료</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">유저 아이콘 테스트</h2>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <UserFilter type="leader" size={28} />
            <span>팀장</span>
          </div>
          <div className="flex items-center gap-2">
            <UserFilter type="user" size={24} />
            <span>팀원</span>
          </div>
        </div>
      </div>

      <p className="m-96">Testpage</p>
      <p>Testpage</p>
      <p>Testpage</p>
    </div>
  );
}

export default Testpage;
