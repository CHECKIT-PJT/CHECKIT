import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';
import GitIgnoreToolbar from '../../components/convention/git/GitIgnoreToolbar';
import GitIgnoreEditor from '../../components/convention/git/GitIgnoreEditor';
import {
  useGetGitignore,
  useCreateGitignore,
  useUpdateGitignore,
  useDeleteGitignore,
} from '../../api/ignoreAPI';

const GitIgnoreConvention = () => {
  const [content, setContent] = useState('');
  const [hasExistingContent, setHasExistingContent] = useState(false);
  const [error, setError] = useState('');
  const { projectId } = useParams();

  const fetchContent = async () => {
    setError(''); // 오류 상태 초기화

    try {
      const data = await useGetGitignore(Number(projectId));
      if (data !== null) {
        setContent(data);
        setHasExistingContent(true);
      } else {
        setContent('');
        setHasExistingContent(false);
      }
    } catch (err) {
      console.error('조회 실패:', err);
      if (err instanceof AxiosError && err.response?.status !== 404) {
        setError('내용을 불러오는데 실패했습니다.');
      }
      setContent('');
      setHasExistingContent(false);
    }
  };

  const handleSave = async (newContent: string) => {
    setError('');

    try {
      if (!hasExistingContent) {
        await useCreateGitignore(Number(projectId), newContent);
        toast.success('성공적으로 생성되었습니다.');
      } else {
        await useUpdateGitignore(Number(projectId), newContent);
        toast.success('성공적으로 수정되었습니다.');
      }

      setContent(newContent);
      setHasExistingContent(true);
    } catch (err) {
      console.error('저장 실패:', err);
      setError('내용을 저장하는데 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    setError('');
    try {
      await useDeleteGitignore(Number(projectId));
      toast.success('삭제가 성공적으로 되었습니다.');
      setContent('');
      setHasExistingContent(false);
    } catch (err) {
      console.error('삭제 실패:', err);
      setError('내용을 삭제하는데 실패했습니다.');
    }
  };

  const handleApplyDefault = async (defaultContent: string) => {
    setError('');

    try {
      await useCreateGitignore(Number(projectId), defaultContent);
      toast.success('기본 템플릿이 등록되었습니다.');
      setContent(defaultContent);
      setHasExistingContent(true);
    } catch (err) {
      console.error('기본 제안 등록 실패:', err);
      setError('기본 제안을 등록하는데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchContent();
  }, [projectId]);

  return (
    <div className="p-4">
      {/* 제목과 툴바를 한 줄에 정렬 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">.gitignore 관리</h2>

        <GitIgnoreToolbar
          content={content}
          onSave={handleSave}
          onDelete={handleDelete}
          onApplyDefault={handleApplyDefault}
          projectId={Number(projectId)}
          hasExistingContent={hasExistingContent}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button
            onClick={fetchContent}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            다시 시도
          </button>
        </div>
      )}

      <GitIgnoreEditor
        content={content}
        onChange={newContent => setContent(newContent)}
      />
    </div>
  );
};

export default GitIgnoreConvention;
