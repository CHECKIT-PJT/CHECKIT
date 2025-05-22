import { useState, useEffect } from 'react';
import {
  useGetCommitConventionReg,
  useCreateCommitConvention,
  useUpdateCommitConvention,
} from '../../../api/commitAPI';

interface Props {
  projectId: number;
  initialPattern?: string;
  onUpdate: () => void;
}

const CommitForm = ({ projectId, initialPattern = '', onUpdate }: Props) => {
  const [pattern, setPattern] = useState(initialPattern);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingPattern, setExistingPattern] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingPattern = async () => {
      try {
        const result = await useGetCommitConventionReg(Number(projectId));
        if (result?.commitConventionReg) {
          setExistingPattern(result.commitConventionReg);
          setPattern(result.commitConventionReg);
        }
      } catch (error) {
        console.error('커밋 컨벤션 조회 실패:', error);
      }
    };
    checkExistingPattern();
  }, [projectId, initialPattern]);

  const validatePattern = (input: string): boolean => {
    try {
      if (!input.trim()) return false;
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    setError('');
    setIsSubmitting(true);

    if (!validatePattern(pattern)) {
      setError('유효한 정규식 패턴을 입력해주세요.');
      return;
    }

    try {
      if (existingPattern) {
        await useUpdateCommitConvention(Number(projectId), pattern);
      } else {
        await useCreateCommitConvention(Number(projectId), pattern);
      }
      setExistingPattern(pattern);
      onUpdate();
    } catch (err) {
      setError('커밋 컨벤션 설정 중 오류가 발생했습니다.');
      console.error('커밋 컨벤션 설정 실패:', err);
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
          커밋 컨벤션 정규식
        </label>
        <div className="text-sm text-gray-500">
          정규식으로 커밋 메시지 규칙을 설정하세요
        </div>
      </div>

      <div className="mt-4 text-sm bg-green-50 p-3 rounded border border-green-100 text-green-800">
        <p className="font-medium">작성 방법 :</p>
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>^feat: - feat: 로 시작하는 커밋</li>
          <li>^(feat|fix|docs): - 여러 타입 허용</li>
          <li>: .+$ - 콜론 뒤 설명 필수</li>
          <li>^(feat|fix|docs|style|refactor|test|chore): .+$ - 전체 예시</li>
        </ul>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className={`border ${error ? 'border-red-500' : 'border-gray-300'} p-3 rounded-md w-full 
            focus:ring-green-500 focus:border-green-500 outline-none transition text-sm`}
          value={pattern}
          onChange={handleInputChange}
          placeholder="예: ^(feat|fix|docs|style|refactor|test|chore): .+$"
          disabled={isSubmitting}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-6 py-3 rounded-md font-medium transition whitespace-nowrap
            ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-800 hover:bg-green-700 text-white'
            }`}
        >
          {isSubmitting ? '처리 중...' : '설정'}
        </button>
      </div>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </div>
  );
};

export default CommitForm;
