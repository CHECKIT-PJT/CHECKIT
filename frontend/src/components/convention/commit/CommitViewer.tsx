import { useEffect, useState } from 'react';

interface Props {
  projectId: string;
}

const CommitViewer = ({ projectId }: Props) => {
  const [pattern, setPattern] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCommitConvention = async () => {
      setLoading(true);
      try {
        // TODO 커밋 전략 조회 API 호출 구현
        // setTimeout(() => {
        //   setPattern(
        //     '^feature/[A-Z]+-[0-9]+|^hotfix/[A-Z]+-[0-9]+|^main$|^release/v[0-9]+\\.[0-9]+\\.[0-9]+$'
        //   );
        //   setLoading(false);
        // }, 500);
      } catch (error) {
        console.error('브랜치 전략 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommitConvention();
  }, [projectId]);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg text-gray-800">현재 커밋 컨벤션</h3>

      {loading ? (
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
      ) : (
        <div className="relative">
          <p className="text-gray-500 bg-gray-50 border border-gray-200 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap ">
            {pattern || '설정된 커밋 컨벤션이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CommitViewer;
