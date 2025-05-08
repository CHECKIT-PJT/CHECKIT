import { FaPlay, FaDesktop } from 'react-icons/fa';
import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';
import { SiSpring } from 'react-icons/si';

interface BuildSelectProps {
  className?: string;
  direction?: 'row' | 'col';
}

const BuildSelect = ({
  className = '',
  direction = 'col',
}: BuildSelectProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'}  items-center justify-center px-3 ${className}`}
    >
      <ChapterCardLong
        title="컨벤션 설정하기"
        subtitle="빌드 전 조건들을 지정하기"
        icon={<FaPlay size={18} className="text-white-500" />}
        bgColor="hover:from-yellow-700 hover:to-yellow-800 border-t"
        onClick={() => navigate('build/option/branch')}
      />
      <ChapterCardLong
        title="Spring 설정"
        subtitle="초기 스프링 설정 선택하기"
        icon={<SiSpring size={18} className="text-white-500" />}
        bgColor="hover:from-green-800 hover:to-green-900 "
        onClick={() => navigate('spring')}
      />
      <ChapterCardLong
        title="빌드 미리보기"
        subtitle="초기 코드 자동 생성"
        icon={<FaDesktop size={18} className="text-white-500" />}
        bgColor="hover:from-stone-600 hover:to-stone-700 "
        onClick={() => navigate('buildpreview')}
      />
    </div>
  );
};

export default BuildSelect;
