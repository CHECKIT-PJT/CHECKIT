interface FuncAddButtonProps {
  onClick: () => void;
}

const FuncAddButton = ({ onClick }: FuncAddButtonProps) => {
  return (
    <button
      className="px-4 py-2 bg-cyan-800 text-white rounded font-bold shadow transition text-sm"
      onClick={onClick}
    >
      기능 추가
    </button>
  );
};

export default FuncAddButton;
