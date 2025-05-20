import { FaDesktop } from 'react-icons/fa';
import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';
import { SiSpring } from 'react-icons/si';
import { LuGitPullRequestCreateArrow } from 'react-icons/lu';
import { IoSettingsOutline } from 'react-icons/io5';
import { VscOpenPreview } from 'react-icons/vsc';

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
        title="Git 설정 추가"
        subtitle="빌드 전 조건들을 지정하기"
        icon={<IoSettingsOutline size={20} />}
        bgColor="hover:bg-green-800 hover:bg-opacity-20 border-t"
        onClick={() => navigate('build/option/branch')}
      />
      <ChapterCardLong
        title="Spring 설정"
        subtitle="초기 스프링 설정 선택하기"
        icon={<SiSpring size={20} />}
        bgColor="hover:bg-green-800 hover:bg-opacity-20 "
        onClick={() => navigate('spring')}
      />
      <ChapterCardLong
        title="빌드 미리 보기"
        subtitle="프로젝트 설계 기반 초기 코드 자동 생성"
        icon={<VscOpenPreview size={20} className="text-white-500" />}
        bgColor="hover:bg-green-800 hover:bg-opacity-20"
        onClick={() => navigate('buildpreview')}
      />
      <ChapterCardLong
        title="현재 프로젝트 불러오기"
        subtitle="Git에 올라간 코드를 가져와서 수정 및 커밋"
        icon={
          <LuGitPullRequestCreateArrow
            size={20}
            className="text-white-500 ml-0.5"
          />
        }
        bgColor="hover:bg-green-800 hover:bg-opacity-20"
        onClick={() => navigate('ide')}
      />
    </div>
  );
};

export default BuildSelect;
