import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeleteProject } from '../../api/projectAPI';

interface JiraButtonProps {
  onClick?: () => void;
}

const JiraButton = ({ onClick }: JiraButtonProps) => {
  const [showModal, setShowModal] = useState(false);
  const [jiraUrl, setJiraUrl] = useState('');
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { mutate: deleteProject } = useDeleteProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Jira URL 처리 로직 추가
    console.log('Jira URL:', jiraUrl);
    setShowModal(false);
    if (onClick) onClick();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 text-base text-primary-600 border border-primary-600 rounded-lg bg-white hover:bg-gradient-to-r hover:from-blue-400 hover:to-blue-600 hover:text-white transition-colors`}
      >
        Jira 연동
      </button>
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 ">
          <div className="bg-white px-14 py-6 rounded-lg shadow-lg text-center  w-[40%]">
            <p className="mb-8 mt-4 text-lg font-bold">
              Jira 연동을 위해 URL을 입력해주세요
            </p>
            <input
              type="url"
              value={jiraUrl}
              onChange={e => setJiraUrl(e.target.value)}
              placeholder="https://atlassian.net"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
            <div className="flex justify-between gap-4 mb-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-700 text-white rounded mr-2 hover:bg-blue-900 transition-colors"
              >
                연동하기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JiraButton;
