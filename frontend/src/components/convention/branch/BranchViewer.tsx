import { useEffect, useState } from 'react';

interface Props {
  projectId: string;
}

const BranchViewer = ({ projectId }: Props) => {
  const [pattern, setPattern] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranchStrategy = async () => {
      setLoading(true);
      try {
        // 브랜치 전략 조회 API 호출 구현
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

    fetchBranchStrategy();
  }, [projectId]);

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg text-gray-800">현재 브랜치 전략</h3>

      {loading ? (
        <div className="animate-pulse h-12 bg-gray-200 rounded"></div>
      ) : (
        <div className="relative">
          <p className="bg-gray-50 border border-gray-200 p-4 rounded-md text-sm overflow-x-auto whitespace-pre-wrap text-gray-500">
            {pattern || '설정된 브랜치 전략이 없습니다.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default BranchViewer;
