import { redirectToJiraLogin } from '../../api/authAPI';
import jiraLogo from '../../assets/jira-1.svg';

interface JiraAccessButtonProps {
  isLinked?: boolean;
}

const JiraAccessButton = ({ isLinked }: JiraAccessButtonProps) => {
  if (isLinked) {
    return (
      <button
        disabled
        className="text-green-700 flex items-center justify-center gap-2 bg-white border border-green-700 px-3 py-1 rounded-md cursor-not-allowed"
      >
        <img
          src={jiraLogo}
          alt="Jira Logo"
          className="w-4 h-4 mr-2 rounded-sm"
        />
        Jira 연동 완료
      </button>
    );
  }

  return (
    <button
      onClick={redirectToJiraLogin}
      className="text-blue-700 flex items-center justify-center gap-2 bg-white border border-blue-700 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
    >
      <img src={jiraLogo} alt="Jira Logo" className="w-4 h-4 mr-2 rounded-sm" />
      Jira 연동
    </button>
  );
};

export default JiraAccessButton;
