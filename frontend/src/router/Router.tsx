import { Route, Routes } from "react-router-dom";
import Layout from "../pages/Layout";
import Testpage from "../pages/Testpage";

const Router = () => {
  // 로그인 체크
  //   const ProtectedRoute = ({ element }) => {
  //     const token = sessionStorage.getItem("token");
  //     return token ? element : <Navigate to="/" replace />;
  //   };
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Testpage />} />
      </Route>
    </Routes>
  );
};

export default Router;
