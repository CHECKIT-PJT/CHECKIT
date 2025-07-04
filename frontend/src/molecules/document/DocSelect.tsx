import { FaProjectDiagram } from 'react-icons/fa';
import { VscGithubAlt } from 'react-icons/vsc';
import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';

interface DocSelectProps {
  className?: string;
  direction?: 'row' | 'col';
}

const DocSelect = ({ className = '', direction = 'col' }: DocSelectProps) => {
  const navigate = useNavigate();

  return (
    <div
      className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'} items-center bg- justify-center px-3 ${className}`}
    >
      <ChapterCardLong
        title="README.md"
        subtitle="프로젝트 개요 및 사용법 확인"
        icon={<VscGithubAlt size={18} />}
        bgColor="hover:bg-blue-400 hover:bg-opacity-40 border-t"
        onClick={() => navigate('doc/readme')}
      />
      <ChapterCardLong
        title="시퀀스 다이어그램"
        subtitle="시스템 흐름 및 상호작용 설계"
        icon={<FaProjectDiagram size={18} />}
        bgColor="hover:bg-blue-400 hover:bg-opacity-40"
        onClick={() => navigate('doc/sequence')}
      />
    </div>
  );
};

export default DocSelect;
