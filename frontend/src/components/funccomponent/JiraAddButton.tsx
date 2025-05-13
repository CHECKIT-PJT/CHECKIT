interface JiraAddButtonProps {
  onClick: () => void;
}

const JiraAddButton = ({ onClick }: JiraAddButtonProps) => {
  return (
    <button
      className="px-4 py-2 bg-[#0052CC] text-white rounded font-bold shadow transition text-sm"
      onClick={onClick}
    >
      이슈 등록
    </button>
  );
};

export default JiraAddButton;
