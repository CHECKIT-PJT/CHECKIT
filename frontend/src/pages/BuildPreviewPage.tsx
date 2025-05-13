import { useState, useEffect } from 'react';
import ProjectHeader from '../molecules/buildpreview/ProjectHeader';
import FileExplorer from '../molecules/buildpreview/FileExplorer';
import CodeViewer from '../molecules/buildpreview/CodeViewer';
import ProjectStats from '../molecules/buildpreview/ProjectStats';
import ActionBar from '../molecules/buildpreview/ActionBar';
import useThemeDetection from '../hooks/useThemeDetection';
import { downloadProject } from '../api/buildpreview';
import { generateCode } from '../api/codegenerateAPI';
import { countFiles, createFilePath } from '../utils/fileUtils';
import { ExpandedFolders, SelectedFile, ApiResponse } from '../types';
import { useNavigate, useParams } from 'react-router-dom';
import Dialog from '../molecules/buildpreview/Dialog';
/**
 * 프로젝트 미리보기 페이지 컴포넌트
 */
const BuildPreviewPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({
    entity: true,
    dto: true,
    controller: true,
    service: true,
    repository: true,
  });
  const [codeDarkMode, setCodeDarkMode] = useState<boolean>(false);
  const [projectData, setProjectData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [dialogMessage, setDialogMessage] = useState<string>('');
  const navigate = useNavigate();
  // 시스템 테마 감지하여 초기 코드 뷰어 테마 설정
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
        const message = err?.message || '알 수 없는 오류가 발생했습니다.';

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

  /**
   * 폴더 확장/축소 토글 함수
   */
  const toggleFolder = (folder: string): void => {
    setExpandedFolders({
      ...expandedFolders,
      [folder]: !expandedFolders[folder],
    });
  };

  /**
   * 파일 선택 함수
   */
  const selectFile = (folder: string, fileName: string): void => {
    if (!projectData) return;

    setSelectedFile({
      name: fileName,
      content: projectData.data[folder][fileName],
      path: createFilePath(folder, fileName),
    });
  };

  /**
   * 프로젝트 다운로드 핸들러
   */
  const handleDownload = async (): Promise<void> => {
    try {
      await downloadProject();
      alert('프로젝트 다운로드가 완료되었습니다.');
    } catch (error) {
      console.error('다운로드 중 오류 발생:', error);
      alert('다운로드 중 오류가 발생했습니다.');
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

  // /**
  //  * 새 프로젝트 생성 핸들러
  //  */
  // const handleCreateNew = async (): Promise<void> => {
  //   try {
  //     await createNewProject();
  //     // 새 프로젝트 생성 페이지로 이동하는 로직 추가
  //   } catch (error) {
  //     console.error("프로젝트 생성 중 오류 발생:", error);
  //     alert("프로젝트 생성 중 오류가 발생했습니다.");
  //   }
  // };

  // 파일 개수 계산
  const fileCount = projectData ? countFiles(projectData.data) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <ProjectHeader />

      {projectData ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/3 bg-gray-50 border-gray-200 border-r overflow-y-auto p-2">
            <FileExplorer
              data={projectData.data}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
              selectedFile={selectedFile}
              selectFile={selectFile}
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

            <ActionBar onDownload={handleDownload} />
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
        message={dialogMessage}
        confirmText="해당 페이지로 이동"
        cancelText="닫기"
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
      />
    </div>
  );
};

export default BuildPreviewPage;
