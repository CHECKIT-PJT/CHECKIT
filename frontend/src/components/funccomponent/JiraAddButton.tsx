import jiraLogo from '../../assets/jira-1.svg';

interface JiraAddButtonProps {
  onClick: () => void;
}

const JiraAddButton = ({ onClick }: JiraAddButtonProps) => {
  return (
    <button
      className="text-white flex items-center justify-center gap-2 bg-blue-800 border px-3 py-1 rounded-md"
      onClick={onClick}
    >
      <img src={jiraLogo} alt="Jira Logo" className="w-4 h-4 mr-2 rounded-sm" />
      이슈 등록
    </button>
  );
};

export default JiraAddButton;
