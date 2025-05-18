import { useEffect, useState } from 'react';
import { useGitPull } from '../api/gitAPI';
import IdeEditor from '../molecules/ide/IdeEditor';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../molecules/layout/loading';
import CustomFalseAlert from '../molecules/layout/CustomFalseAlert';

interface FileNode {
  path: string;
  type: 'file' | 'folder';
  content: string | null;
}

interface GitData {
  root: string;
  branch: string;
  files: FileNode[];
}

const IdeEditorPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [gitData, setGitData] = useState<GitData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { mutate: gitPull } = useGitPull(Number(projectId));

  useEffect(() => {
    gitPull(undefined, {
      onSuccess: data => {
        setGitData(data);
        setIsLoading(false);
      },
      onError: error => {
        console.error('Git pull error:', error);
        setAlertMessage(
          'Git 저장소를 불러오는데 실패했습니다.\n Build 후 저장소를 먼저 개설해 주세요.'
        );
        setIsAlertOpen(true);
        setIsLoading(false);
      },
    });
  }, [gitPull, projectId]);

  const handleAlertConfirm = () => {
    setIsAlertOpen(false);
    navigate(`/project/${projectId}`);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col px-6">
      <IdeEditor gitData={gitData} />
      <CustomFalseAlert
        isOpen={isAlertOpen}
        title="프로젝트 설계 완료 전"
        message={alertMessage}
        confirmText="프로젝트로 돌아가기"
        onConfirm={handleAlertConfirm}
      />
    </div>
  );
};

export default IdeEditorPage;
