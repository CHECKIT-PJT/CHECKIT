import { useNavigate, Outlet } from 'react-router-dom';

const DevelopSelect = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <Outlet />
    </div>
  );
};

export default DevelopSelect;
