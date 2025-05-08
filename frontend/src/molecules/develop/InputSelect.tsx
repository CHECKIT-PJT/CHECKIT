import { FaDatabase, FaCode, FaFileAlt } from 'react-icons/fa';
import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';

interface InputSelectProps {
  className?: string;
  direction?: 'row' | 'col';
}

const InputSelect = ({
  className = '',
  direction = 'col',
}: InputSelectProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} items-center justify-center px-3 ${className}`}
    >
      <ChapterCardLong
        title="ERD 설계"
        subtitle="데이터베이스 구조 설계"
        icon={<FaDatabase size={18} className="text-white-500" />}
        bgColor="hover:from-slate-500 hover:to-slate-600 border-t"
        onClick={() => navigate('develop/erd')}
      />
      <ChapterCardLong
        title="API 설계"
        subtitle="API 엔드포인트 설계"
        icon={<FaCode size={18} className="text-white-700" />}
        bgColor="hover:from-green-700 hover:to-green-800"
        onClick={() => navigate('develop/api')}
      />
      <ChapterCardLong
        title="기능 명세서"
        subtitle="시스템 기능 상세 설계"
        icon={<FaFileAlt size={18} className="text-white-500" />}
        bgColor="hover:from-blue-700 hover:to-blue-800"
        onClick={() => navigate('develop/function')}
      />
    </div>
  );
};

export default InputSelect;
