interface FuncAddButtonProps {
  onClick: () => void;
}

const FuncAddButton = ({ onClick }: FuncAddButtonProps) => {
  return (
    <button
      className="px-4 py-2 bg-yellow-400 text-black rounded font-bold shadow transition text-sm"
      onClick={onClick}
    >
      기능 추가
    </button>
  );
};

export default FuncAddButton;
