import Button from "../../components/landing/Button";
import { GitHubIcon, GitLabIcon } from "../../components/landing/Icons";

interface LoginButtonProps {
  provider: "github" | "gitlab";
  onClick?: () => void;
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({
  provider,
  onClick,
  className = "",
}) => {
  const icons = {
    github: <GitHubIcon className="mr-2" />,
    gitlab: <GitLabIcon className="mr-2" />,
  };

  const labels = {
    github: "GitHub 로그인",
    gitlab: "GitLab 로그인",
  };

  // GitLab 버튼의 경우 아이콘 위치를 약간 조정
  const iconClasses = {
    github: "mr-2",
    gitlab: "mr-2 relative -top -px",
  };

  return (
    <Button
      variant={provider}
      onClick={onClick}
      className={`mb-4 ${className}`}
    >
      {provider === "github" ? (
        <GitHubIcon className={iconClasses.github} />
      ) : (
        <GitLabIcon className={iconClasses.gitlab} />
      )}
      {labels[provider]}
    </Button>
  );
};

export default LoginButton;
