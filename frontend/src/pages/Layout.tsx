import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  const [isTooSmall, setIsTooSmall] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsTooSmall(window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // 초기 실행
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isTooSmall) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-100">
        <div className="text-center text-zinc-600 px-6">
          <h1 className="text-2xl font-semibold mb-2">접속 불가</h1>
          <p className="text-lg">
            이 서비스는 PC 화면(1024px 이상)에서만 이용 가능합니다.
            <br />더 넓은 화면으로 접속해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="w-full max-w-6xl h-full overflow-y-auto bg-back-10 text-back-20 shadow-xl rounded-2xl p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
