import { useState, useEffect } from 'react';
import {
  useGetBranchConventionReg,
  useCreateBranchConvention,
  useUpdateBranchConvention,
} from '../../../api/branchAPI';

interface Props {
  projectId: number;
  initialPattern?: string;
  onUpdate: () => void;
}

const BranchForm = ({ projectId, initialPattern = '', onUpdate }: Props) => {
  const [pattern, setPattern] = useState(initialPattern);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingPattern, setExistingPattern] = useState<string | null>(null);

  // 컴포넌트 마운트 시 기존 패턴 확인
  useEffect(() => {
    const checkExistingPattern = async () => {
      try {
        const result = await useGetBranchConventionReg(Number(projectId));
        setExistingPattern(result?.branchConventionReg || null);
        if (result?.branchConventionReg) {
          setPattern(result.branchConventionReg);
        }
      } catch (err) {}
    };

    checkExistingPattern();
  }, [projectId]);

  const validatePattern = (input: string): boolean => {
    try {
      if (!input.trim()) return false;
      // 정규식 패턴 검증
      new RegExp(input);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validatePattern(pattern)) {
      setError('유효한 정규식 패턴을 입력해주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      if (existingPattern) {
        await useUpdateBranchConvention(Number(projectId), pattern);
      } else {
        await useCreateBranchConvention(Number(projectId), pattern);
      }

      setExistingPattern(pattern);
      onUpdate();
    } catch (err) {
      setError('브랜치 전략 설정 중 오류가 발생했습니다.');
      console.error('브랜치 전략 설정 실패:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPattern(e.target.value);
    setError('');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="font-semibold text-gray-800">
          브랜치 네이밍 정규식
        </label>
        <div className="text-sm text-gray-500">
          정규식으로 브랜치 이름 규칙을 설정하세요
        </div>
      </div>

      <div className="mt-4 text-sm bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
        <p className="font-medium">작성 방법 :</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>^feature/ - feature/ 로 시작하는 브랜치</li>
          <li>[A-Z]+-[0-9]+ - JIRA-123 형식의 이슈 ID</li>
          <li>| - 또는(OR) 조건</li>
          <li>^main$ - main 이름의 브랜치 (정확히 일치)</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className={`border ${error ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md w-full 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition
            font-mono text-sm`}
          value={pattern}
          onChange={handleInputChange}
          placeholder="예: ^feature/[A-Z]+-[0-9]+|^hotfix/|^main$|^release/v"
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-md font-medium transition whitespace-nowrap
            ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {isSubmitting ? '처리 중...' : '설정'}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default BranchForm;
