import { FaDatabase, FaCode, FaFileAlt } from 'react-icons/fa';
import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';

const InputSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <ChapterCardLong
        title="ERD 설계"
        subtitle="데이터베이스 구조 설계"
        icon={<FaDatabase size={18} className="text-gray-200" />}
        bgColor="hover:from-slate-500 hover:to-slate-600"
        onClick={() => navigate('erd')}
      />
      <ChapterCardLong
        title="API 설계"
        subtitle="API 엔드포인트 설계"
        icon={<FaCode size={18} className="text-teal-700" />}
        bgColor="hover:from-green-600 hover:to-green-700"
        onClick={() => navigate('api')}
      />
      <ChapterCardLong
        title="기능 명세서"
        subtitle="시스템 기능 상세 명세"
        icon={<FaFileAlt size={18} className="text-white-500" />}
        bgColor="hover:from-blue-500 hover:to-blue-600"
        onClick={() => navigate('function')}
      />
    </div>
  );
};

export default InputSelect;
