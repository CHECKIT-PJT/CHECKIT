import { logout } from '../../api/authAPI';
import logo from '../../assets/logo.png';
import title from '../../assets/title.png';
import { useNavigate, useLocation } from 'react-router-dom';
import useProjectStore from '../../stores/projectStore';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useProjectStore();

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.clear();
      navigate('/');
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : '로그아웃 중 오류가 발생했습니다.'
      );
    }
  };

  return (
    <header className="w-full border-b-2 border-gray-200 px-6 py-3 flex items-center h-20 bg-slate-100 relative">
      <div
        className="flex items-center gap-2 w-1/6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
        onClick={() => navigate('/project')}
      >
        <img src={logo} className="w-1/4 h-full" />
        <img src={title} className="w-1/2 h-full" />
      </div>

      <div className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-blue-800 truncate max-w-xl text-center">
        {location.pathname.match(/^\/project\/\d+$/) &&
          (currentProject?.projectName || '')}
      </div>

      <nav className="flex items-center gap-11 text-sm font-semibold ml-auto">
        <span
          className="cursor-pointer hover:text-blue-800 hover:scale-105 transition-transform duration-200 text-base"
          onClick={handleLogout}
        >
          로그아웃
        </span>
      </nav>
    </header>
  );
};

export default Header;
