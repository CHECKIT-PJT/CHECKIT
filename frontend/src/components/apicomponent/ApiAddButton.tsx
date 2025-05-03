interface ApiAddButtonProps {
  onClick: () => void;
}

const ApiAddButton = ({ onClick }: ApiAddButtonProps) => {
  return (
    <button
      className="px-4 py-2 bg-cyan-800 text-white rounded font-bold shadow transition text-sm"
      onClick={onClick}
    >
      API 추가
    </button>
  );
};

export default ApiAddButton;
