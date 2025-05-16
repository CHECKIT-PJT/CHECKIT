import LoginForm from '../molecules/landing/LoginForm';
import { redirectToGitLabLogin } from '../api/authAPI';

const LandingPage = () => {
  const handleGitHubLogin = () => {};

  const handleGitLabLogin = () => {
    redirectToGitLabLogin();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-blue-100 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-md transition-transform duration-300">
        <div className="flex flex-col items-center">
          {/* <img src={Logo} alt="로고" className="mb-8" /> */}
          <h1 className="text-2xl font-semibold text-gray-800 mb-8">
            환영합니다
          </h1>

          <LoginForm
            onGitHubLogin={handleGitHubLogin}
            onGitLabLogin={handleGitLabLogin}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
