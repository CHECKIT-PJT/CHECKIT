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

const ChapterCard = ({
  title,
  bgColor,
  onClick,
  icon = <IoRocketOutline size={20} />,
}: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 cursor-pointer transition-all w-60 h-36 flex flex-col justify-between ${bgColor || ''} bg-white border text-black hover:bg-gradient-to-br hover:from-blue-300 hover:to-blue-500 hover:text-white`}
    >
      <div className="text-xl font-semibold">{title}</div>
      <div className="flex flex-col">
        <div className="border-t border-gray-200 my-2"></div>
        <div className="flex justify-between items-center text-lg font-medium">
          <span>Time to Design!</span>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default ChapterCard;
