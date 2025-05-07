interface ProjectHeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * 프로젝트 헤더 컴포넌트
 */
const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  title = "프로젝트 파일 구조 미리보기",
  subtitle = "생성된 프로젝트 구조와 파일 내용을 확인하세요",
}) => {
  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm opacity-80">{subtitle}</p>
      </div>
    </header>
  );
};

export default ProjectHeader;
