// components/Card.tsx
import { ReactNode } from 'react';
import { IoRocketOutline } from 'react-icons/io5';
import { RiArrowRightSLine } from 'react-icons/ri';

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
      className={`p-6 cursor-pointer transition-all duration-300 ease-in-out
        w-full h-14 flex items-center justify-between
        ${bgColor || ''} bg-white border-b text-black hover:bg-gradient-to-r hover:text-white`}
    >
      <div className="flex items-center gap-8">
        <div className="transition-transform duration-300 hover:scale-110">
          {icon}
        </div>
        <div className="text-lg font-semibold tracking-wide">{title}</div>
      </div>
      <div className="flex items-center gap-12">
        <span className="text-xs font-medium text-gray-400">{subtitle}</span>
        <RiArrowRightSLine size={18} />
      </div>
    </div>
  );
};

export default ChapterCardLong;
