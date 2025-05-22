interface ProjectStatsProps {
  status: string;
  message: string;
  fileCount: number;
}

/**
 * 프로젝트 통계 정보 컴포넌트
 */
const ProjectStats: React.FC<ProjectStatsProps> = ({
  status,
  message,
  fileCount,
}) => {
  return (
    <div className="text-xs text-gray-500 mt-4 p-2">
      <p>
        상태: <span className="text-green-500">✓ {status}</span>
      </p>
      <p>메시지: {message}</p>
      <p>생성된 파일: {fileCount}개</p>
    </div>
  );
};

export default ProjectStats;
