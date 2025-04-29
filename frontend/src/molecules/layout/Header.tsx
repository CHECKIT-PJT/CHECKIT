import logo from '../../assets/logo.png';
import title from '../../assets/title.png';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const Header = ({ onLogout, isLoggedIn }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    // 로그아웃 후 리다이렉트 로직
  };

  return (
    <header className="w-full border-b-2 border-gray-200 px-6 py-3 flex items-center justify-between h-20 bg-slate-100">
      <div className="flex items-center gap-2 w-1/6">
        <img src={logo} className="w-1/4 h-full" />
        <img src={title} className="w-1/2 h-full" />
      </div>

      <nav className="flex items-center gap-11 text-sm font-semibold mr-4">
        {isLoggedIn ? (
          <>
            <span
              className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
              onClick={() => navigate('/teams')}
            >
              팀 보러 가기
            </span>
            <span
              className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
              onClick={() => navigate('/create')}
            >
              팀 생성하기
            </span>
            <span
              className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
              onClick={() => navigate('/invite')}
            >
              요청 메세지
            </span>
            <span
              className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
              onClick={handleLogout}
            >
              로그아웃
            </span>
          </>
        ) : (
          <span
            className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
            onClick={() => navigate('/login')}
          >
            로그인
          </span>
        )}
      </nav>
    </header>
  );
};

export default Header;
