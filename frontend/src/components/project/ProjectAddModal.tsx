import { useState } from 'react';
import { FiX } from 'react-icons/fi';

interface ProjectAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: { projectName: string }) => void;
}

const ProjectAddModal = ({ isOpen, onClose, onSave }: ProjectAddModalProps) => {
  const [projectName, setProjectName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateProjectName = (name: string) => {
    if (/\s/.test(name)) {
      return '프로젝트 이름에 띄어쓰기를 사용할 수 없습니다.';
    }
    if (/[가-힣]/.test(name)) {
      return '프로젝트 이름에 한글을 사용할 수 없습니다.';
    }
    return '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProjectName(newName);
    setError(validateProjectName(newName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateProjectName(projectName);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (projectName.trim()) {
      onSave({ projectName });
      setProjectName('');
      setError('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">새 프로젝트 추가</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="프로젝트 이름을 입력하세요"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={!projectName.trim() || !!error}
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectAddModal;
