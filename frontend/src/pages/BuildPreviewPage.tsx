import { useState, useEffect } from 'react';
import ProjectHeader from '../molecules/buildpreview/ProjectHeader';
import FileExplorer from '../molecules/buildpreview/FileExplorer';
import CodeViewer from '../molecules/buildpreview/CodeViewer';
import ProjectStats from '../molecules/buildpreview/ProjectStats';
import useThemeDetection from '../hooks/useThemeDetection';
import { downloadProject } from '../api/buildpreview';
import { generateCode } from '../api/codegenerateAPI';
import { countFiles, createFilePath } from '../utils/fileUtils';
import { ExpandedFolders, SelectedFile, ApiResponse } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '../molecules/buildpreview/Dialog';
import { downloadBuildZip } from '../api/downloadAPI';
import CustomAlert from '../molecules/layout/CustomAlert';

const BuildPreviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({});
  const [codeDarkMode, setCodeDarkMode] = useState<boolean>(false);
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
      } catch (err: any) {
        console.error('코드 생성 실패:', err);

        const code = err?.code ?? 0;
        let message = err?.message || '알 수 없는 오류가 발생했습니다.';

        // 500 에러일 경우 ERD 관련 메시지로 변경
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

  const toggleFolder = (folderPath: string): void => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const selectFile = (folderPath: string, fileName: string): void => {
    if (!projectData) return;

    const pathSegments = folderPath.split('/');
    let current: any = projectData.data;

    for (const segment of pathSegments) {
      if (!current[segment]) return;
      current = current[segment];
    }

    const fileContent = current[fileName];
    if (!fileContent) return;

    setSelectedFile({
      name: fileName,
      content: fileContent,
      path: `${folderPath}/${fileName}`,
    });
  };

  const handleDownload = async (): Promise<void> => {
    if (!projectId) return;

    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      setAlertMessage('인증이 필요합니다. 다시 로그인해주세요.');
      setIsAlertOpen(true);
      return;
    }
    await downloadBuildZip(Number(projectId), token);
    setAlertMessage('프로젝트 다운로드가 완료되었습니다.');
    setIsAlertOpen(true);
  };

  const handleRepoCreate = async (): Promise<void> => {
    try {
      console.log('저장소 생성 중...');
      setDialogTitle('저장소 생성 성공');
      setDialogMessage('프로젝트 저장소가 성공적으로 생성되었습니다.');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('저장소 생성 중 오류 발생:', error);
      setDialogTitle('저장소 생성 실패');
      setDialogMessage('저장소 생성 중 오류가 발생했습니다.');
      setIsDialogOpen(true);
    }
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

  const fileCount = projectData ? countFiles(projectData.data) : 0;

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
            <FileExplorer
              data={projectData.data}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              selectFile={selectFile}
              rootPackage={projectData.rootPackage}
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
