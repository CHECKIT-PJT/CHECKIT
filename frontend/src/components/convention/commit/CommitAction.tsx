import { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdOutlineDownloading } from 'react-icons/md';

interface Props {
  projectId: string;
  onUpdate: () => void;
}

const CommitAction = ({ projectId, onUpdate }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirm(false);

    try {
      // TODO 커밋 컨벤션 삭제 API 호출
      console.log('커밋 컨벤션 삭제 요청됨');
      onUpdate();
    } catch (error) {
      console.error('커밋 컨벤션 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      //   const response = async api 호출
      //   );
      //   if (response.ok) {
      //     const data = await response.json();
      //     const blob = new Blob([data.file], { type: 'text/markdown' });
      //     const url = window.URL.createObjectURL(blob);
      //     const a = document.createElement('a');
      //     a.href = url;
      //     a.download = 'COMMIT_CONVENTION.md';
      //     document.body.appendChild(a);
      //     a.click();
      //     document.body.removeChild(a);
      //     window.URL.revokeObjectURL(url);
      //   } else {
      //     const data = await response.json();
      //     console.error('파일 다운로드 실패:', data.message);
      //   }
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex items-center gap-2 px-4 py-1 rounded-md text-sm transition ${
            isDeleting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          <RiDeleteBin6Line className="h-5 w-5" />
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
            isDownloading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-800 hover:bg-teal-700 text-white'
          }`}
        >
          <MdOutlineDownloading className="h-5 w-5" />
          {isDownloading ? '다운로드 중...' : '파일 다운로드'}
        </button>
      </div>

      {/* 삭제 확인 */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 max-w-md mx-4 shadow-xl">
            <div className="flex justify-center mb-4">
              <RiDeleteBin6Line className="h-9 w-9 bg-red-500 opacity-40 text-white rounded-full p-2" />
            </div>
            <p className="text-gray-700 mb-6">
              커밋 컨벤션 삭제는 되돌릴 수 없습니다.
            </p>

            <div className="flex gap-3 justify-between">
              <button
                onClick={() => setShowConfirm(false)}
                className="w-1/2 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition"
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                className="w-1/2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommitAction;
