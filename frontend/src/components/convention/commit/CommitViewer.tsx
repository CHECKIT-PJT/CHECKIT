import { useEffect, useState } from 'react';
import { useGetCommitConventionReg } from '../../../api/commitAPI';
import axios from 'axios';

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
        const result = await useGetCommitConventionReg(Number(projectId));
        setPattern(result?.commitConventionReg || '');
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // 404 에러는 정상적인 케이스로 처리 (커밋 컨벤션이 없는 경우)
          setPattern('');
        } else {
          console.error('커밋 컨벤션 조회 실패:', error);
        }
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
