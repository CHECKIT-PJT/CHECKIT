import { useState, useEffect } from 'react';
import ProjectHeader from '../molecules/buildpreview/ProjectHeader';
import CodeViewer from '../molecules/buildpreview/CodeViewer';
import ProjectStats from '../molecules/buildpreview/ProjectStats';
import useThemeDetection from '../hooks/useThemeDetection';
import { generateCode } from '../api/codegenerateAPI';
import { countFiles } from '../utils/fileUtils';
import { ApiResponse } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '../molecules/buildpreview/Dialog';
import { downloadBuildZip } from '../api/downloadAPI';
import CustomAlert from '../molecules/layout/CustomAlert';
import useProjectStore from '../stores/projectStore';
import { useCreateGitlabProject } from '../api/gitAPI';
import FileTree from '../components/FileTree';
import { FileNode } from '../api/buildpreview';

const BuildPreviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [projectData, setProjectData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] =
    useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const navigate = useNavigate();

  // 시스템 테마 감지
  const systemDarkMode = useThemeDetection();
  const [codeDarkMode, setCodeDarkMode] = useState<boolean>(false);

  const { currentProject } = useProjectStore();
  const repoName = currentProject?.projectName || '';

  const { mutate: createGitlabProject } = useCreateGitlabProject(
    Number(projectId),
    {
      repoName: repoName,
      visibility: 'private',
      message: '[CHECKIT] init: 프로젝트 초기 커밋',
    },
  );

  useEffect(() => {
    setCodeDarkMode(systemDarkMode);
  }, [systemDarkMode]);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const response = await generateCode(projectId);
        setProjectData(response);
      } catch (err: unknown) {
        console.error('코드 생성 실패:', err);
        const code = (err as any)?.code ?? 0;
        let message =
          (err as any)?.message || '알 수 없는 오류가 발생했습니다.';
        if (code === 500) {
          message = 'ERD가 없습니다, 먼저 생성해주세요.';
        }
        setErrorCode(code);
        setDialogTitle('코드 생성 실패');
        setDialogMessage(message);
        setIsDialogOpen(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjectData();
  }, [projectId]);

  const handleFileClick = (file: FileNode) => {
    setSelectedFile(file);
  };

  const handleDownload = async (): Promise<void> => {
    if (!projectId) return;

    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      return;
    }
    await downloadBuildZip(Number(projectId), token);
    setAlertMessage('프로젝트 다운로드가 완료되었습니다.');
    setIsAlertOpen(true);
  };

  const handleRepoCreate = async (): Promise<void> => {
    if (!repoName) {
      setDialogTitle('저장소 생성 실패');
      setDialogMessage('프로젝트 이름이 없습니다.');
      setIsDialogOpen(true);
      return;
    }

    createGitlabProject(undefined, {
      onSuccess: () => {
        setDialogTitle('저장소 생성 성공');
        setDialogMessage('GitLab 저장소가 성공적으로 생성되었습니다.');
        setIsSuccessDialogOpen(true);
      },
      onError: (error: any) => {
        setDialogTitle('저장소 생성 실패');
        setDialogMessage(
          error?.message || '저장소 생성 중 오류가 발생했습니다.',
        );
        setIsDialogOpen(true);
      },
    });
  };

  const handleDialogConfirm = () => {
    setIsDialogOpen(false);

    switch (errorCode) {
      case 401:
        navigate(`/project/${projectId}/develop/api`);
        break;
      case 402:
        navigate(`/project/${projectId}/develop/function`);
        break;
      case 404:
        navigate(`/project/${projectId}/spring`);
        break;
      case 405:
      case 500:
        navigate(`/project/${projectId}/develop/erd`);
        break;
      default:
        navigate(`/project/${projectId}`);
    }

    setErrorCode(null);
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
  };

  const handleSuccessDialogConfirm = () => {
    setIsSuccessDialogOpen(false);
  };

  const handleSuccessDialogCancel = () => {
    setIsSuccessDialogOpen(false);
  };

  const fileCount = projectData?.data?.files
    ? countFiles({ files: projectData.data.files })
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <ProjectHeader onDownload={handleDownload} onCreate={handleRepoCreate} />

      {projectData ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 bg-gray-50 border-gray-200 border-r overflow-y-auto p-2">
            <FileTree
              files={projectData.data.files}
              selectedFile={selectedFile?.path || null}
              onFileClick={handleFileClick}
              branch="main"
              root=""
            />

            <ProjectStats
              status={String(projectData.status)}
              message={projectData.message}
              fileCount={fileCount}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <CodeViewer
              selectedFile={selectedFile}
              codeDarkMode={codeDarkMode}
              setCodeDarkMode={setCodeDarkMode}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <div className="text-xl">프로젝트 데이터가 없습니다.</div>
        </div>
      )}

      <Dialog
        isOpen={isDialogOpen}
        title={dialogTitle}
        message={`${dialogMessage}\n페이지로 이동하시겠습니까?`}
        confirmText="이동"
        cancelText="닫기"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        success={errorCode === 200}
      />

      <Dialog
        isOpen={isSuccessDialogOpen}
        title={dialogTitle}
        message={dialogMessage}
        confirmText="확인"
        cancelText="닫기"
        onConfirm={handleSuccessDialogConfirm}
        onCancel={handleSuccessDialogCancel}
        success={true}
      />

      <CustomAlert
        isOpen={isAlertOpen}
        message={alertMessage}
        confirmText="확인"
        onConfirm={() => setIsAlertOpen(false)}
      />
    </div>
  );
};

export default BuildPreviewPage;
