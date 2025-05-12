import { redirectToJiraLogin } from '../../api/authAPI';
import jiraLogo from '../../assets/jira-1.svg';

const JiraConnectButton = () => {
  return (
    <button
      onClick={redirectToJiraLogin}
      className="text-slate-500 flex items-center justify-center gap-2 bg-white border border-slate-200 px-3 py-1 rounded-md"
    >
      <img
        src={jiraLogo}
        alt="Jira Logo"
        className="w-4 h-4 mr-2 bg-white rounded-sm"
      />
      Jira 연동하기
    </button>
  );
};

export default JiraConnectButton;
