import { logout } from '../../api/authAPI';
import logo from '../../assets/logo.png';
import title from '../../assets/title.png';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  userName?: string;
  isLoggedIn?: boolean;
}

const Header = ({ isLoggedIn }: HeaderProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result === 'unauthorized') {
        sessionStorage.clear();
        navigate('/');
        return;
      }
      sessionStorage.clear();
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <header className="w-full border-b-2 border-gray-200 px-6 py-3 flex items-center justify-between h-20 bg-slate-100">
      <div
        className="flex items-center gap-2 w-1/6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => navigate('/project')}
      >
        <img src={logo} className="w-1/4 h-full" />
        <img src={title} className="w-1/2 h-full" />
      </div>

      <nav className="flex items-center gap-11 text-sm font-semibold mr-4">
        {isLoggedIn ? (
          <span
            className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
            onClick={handleLogout}
          >
            로그아웃
          </span>
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
