import LoginButton from "./LoginButton";

interface LoginFormProps {
  onGitHubLogin?: () => void;
  onGitLabLogin?: () => void;
  className?: string;
}

const LoginForm = ({
  onGitHubLogin,
  onGitLabLogin,
  className = "",
}: LoginFormProps) => {
  return (
    <div className={`w-full ${className}`}>
      <LoginButton provider="github" onClick={onGitHubLogin} />
      <LoginButton provider="gitlab" onClick={onGitLabLogin} />
    </div>
  );
};

export default LoginForm;
