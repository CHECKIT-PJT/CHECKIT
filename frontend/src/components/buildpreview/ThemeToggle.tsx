import React from "react";
import { MdOutlineWbSunny } from "react-icons/md";
import { FiMoon } from "react-icons/fi";

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  size?: number;
}

/**
 * 테마 전환 토글 버튼 컴포넌트
 */
const ThemeToggle: React.FC<ThemeToggleProps> = ({
  isDarkMode,
  onToggle,
  size = 16,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full ${
        isDarkMode
          ? "bg-gray-200 hover:bg-gray-300"
          : "bg-gray-300 hover:bg-gray-400"
      }`}
      aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDarkMode ? <MdOutlineWbSunny size={size} /> : <FiMoon size={size} />}
    </button>
  );
};

export default ThemeToggle;
