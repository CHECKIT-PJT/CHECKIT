// components/Card.tsx
import { ReactNode } from 'react';
import { IoRocketOutline } from 'react-icons/io5';

interface CardProps {
  title: string;
  subtitle?: string;
  bgColor?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

const ChapterCardLong = ({
  title,
  subtitle = 'Go to check',
  bgColor,
  onClick,
  icon = <IoRocketOutline size={18} />,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 cursor-pointer transition-all duration-300 ease-in-out
        w-[400px] h-24 flex items-center justify-between
        ${bgColor || ''} bg-white border text-black hover:bg-gradient-to-r hover:from-blue-300 hover:to-blue-500 hover:text-white`}
    >
      <div className="text-xl font-semibold tracking-wide">{title}</div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{subtitle}</span>
        <div className="transition-transform duration-300 hover:scale-110">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default ChapterCardLong;
