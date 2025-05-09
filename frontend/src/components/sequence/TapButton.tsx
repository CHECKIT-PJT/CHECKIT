interface TabButtonProps {
  id: string;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

/**
 * 탭 버튼 컴포넌트
 */
const TabButton: React.FC<TabButtonProps> = ({
  id,
  name,
  isActive,
  onClick,
}) => {
  return (
    <button
      key={id}
      className={`px-4 py-2 font-medium rounded-t-lg transition-all ${
        isActive
          ? "bg-white border border-b-0 text-blue-600 shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
      style={{
        marginRight: "4px",
        borderColor: isActive ? "#E5E7EB" : "transparent",
      }}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default TabButton;
