import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../molecules/layout/Header';
import { ToastContainer } from 'react-toastify';

const Layout = () => {
  const [isTooSmall, setIsTooSmall] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      const isWidthTooSmall = window.innerWidth < 512;
      const isHeightTooSmall = window.innerHeight < 600;
      setIsTooSmall(isWidthTooSmall || isHeightTooSmall);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isTooSmall) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-100">
        <div className="text-center text-zinc-600 px-6">
          <h1 className="text-2xl font-semibold mb-2">큰 화면으로 만나요!</h1>
          <p className="text-lg">
            CHECKIT 서비스는 PC 화면(512px 이상, 600px 이상)에서만 이용
            가능합니다.
            <br />더 넓은 화면으로 접속해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-gray-50 text-gray-900">
      <div className="flex flex-col w-full h-full">
        <Header />
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide scroll-target">
          <Outlet />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Layout;
