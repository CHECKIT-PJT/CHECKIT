import { useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdOutlineDownloading } from 'react-icons/md';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';
import {
  useDeleteBranchConvention,
  useDownloadBranchConvention,
} from '../../../api/branchAPI';

interface Props {
  projectId: number;
  onUpdate: () => void;
}

const BranchActions = ({ projectId, onUpdate }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isTooltipFixed, setIsTooltipFixed] = useState(false);

  const toggleTooltip = () => {
    setIsTooltipFixed(!isTooltipFixed);
    setShowTooltip(!isTooltipFixed);
  };

  const handleMouseEnter = () => {
    if (!isTooltipFixed) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isTooltipFixed) {
      setShowTooltip(false);
    }
  };

  const handleDelete = async () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setShowConfirm(false);

    try {
      await useDeleteBranchConvention(Number(projectId));
      onUpdate();
    } catch (error) {
      console.error('브랜치 전략 삭제 실패:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const response = await useDownloadBranchConvention(Number(projectId));

      // Content-Disposition 헤더에서 파일명 추출
      const disposition = response.headers['content-disposition'];
      const match = disposition?.match(/filename="?(.+?)"?$/);
      const filename = match?.[1] || 'pre-commit';

      // 파일 다운로드 처리
      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      toast.error('파일 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <button
            onClick={toggleTooltip}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
              isTooltipFixed ? 'bg-blue-700' : 'bg-blue-800 hover:bg-blue-700'
            } text-white`}
          >
            <IoMdInformationCircleOutline className="h-5 w-5" />
            사용법
          </button>

          {showTooltip && (
            <div className="absolute z-50 w-[345px] p-4 mt-2 text-sm text-gray-700 bg-white rounded-lg shadow-lg border border-gray-200">
              <p className="mb-4">
                <b>.git/hooks </b> 에 다운받은 파일에 넣어주세요.
              </p>
              <p className="mb-4">
                .git 디렉토리는 숨김 폴더이므로, <br />
                숨김 파일 보기 기능을 활성화해야 보일 수 있습니다.
              </p>
              <p>
                파일이 정상적으로 실행되지 않는 경우, <br />
                다음 명령어로 실행 권한을 부여해 주세요:
              </p>
              <code className="block mt-2 p-2 bg-gray-100 rounded">
                chmod +x .git/hooks/pre-commit
              </code>
            </div>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
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
              브랜치 전략 삭제 작업은 되돌릴 수 없습니다.
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

export default BranchActions;
