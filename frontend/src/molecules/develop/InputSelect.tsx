import ChapterCardLong from '../../components/chapter/ChapterCardLong';
import { useNavigate } from 'react-router-dom';
import { VscGithubAlt } from 'react-icons/vsc';
import { TbDatabaseEdit } from 'react-icons/tb';
import { FaCode } from 'react-icons/fa6';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { LiaProjectDiagramSolid } from 'react-icons/lia';

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
        icon={<TbDatabaseEdit size={20} />}
        bgColor="hover:bg-blue-200 hover:bg-opacity-40 border-t"
        onClick={() => navigate('develop/erd')}
      />

      <ChapterCardLong
        title="API 설계"
        subtitle="API 엔드포인트 설계"
        icon={<FaCode size={20} />}
        bgColor="hover:bg-blue-200 hover:bg-opacity-40"
        onClick={() => navigate('develop/api')}
      />
      <ChapterCardLong
        title="기능 명세서"
        subtitle="시스템 기능 상세 설계"
        icon={<IoDocumentTextOutline size={20} />}
        bgColor="hover:bg-blue-200 hover:bg-opacity-40"
        onClick={() => navigate('develop/function')}
      />
      <ChapterCardLong
        title="시퀀스 다이어그램"
        subtitle="AI와 시스템 흐름 및 상호작용 설계"
        icon={<LiaProjectDiagramSolid size={20} />}
        bgColor="hover:bg-blue-400 hover:bg-opacity-40"
        onClick={() => navigate('doc/sequence')}
      />
      <ChapterCardLong
        title="README.md"
        subtitle="AI를 통해 프로젝트 개요 및 사용법 작성"
        icon={<VscGithubAlt size={20} />}
        bgColor="hover:bg-blue-400 hover:bg-opacity-40"
        onClick={() => navigate('doc/readme')}
      />
    </div>
  );
};

export default InputSelect;
