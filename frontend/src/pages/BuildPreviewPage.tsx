import { useState, useEffect } from "react";
import ProjectHeader from "../molecules/buildpreview/ProjectHeader";
import FileExplorer from "../molecules/buildpreview/FileExplorer";
import CodeViewer from "../molecules/buildpreview/CodeViewer";
import ProjectStats from "../molecules/buildpreview/ProjectStats";
import ActionBar from "../molecules/buildpreview/ActionBar";
import useThemeDetection from "../hooks/useThemeDetection";
import {
  sampleApiResponse,
  downloadProject,
  createNewProject,
} from "../api/buildpreview";
import { countFiles, createFilePath } from "../utils/fileUtils";
import { ExpandedFolders, SelectedFile } from "../types";

/**
 * 프로젝트 미리보기 페이지 컴포넌트
 */
const BuildPreviewPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<ExpandedFolders>({
    entity: true,
    dto: true,
    controller: true,
    service: true,
    repository: true,
  });
  const [codeDarkMode, setCodeDarkMode] = useState<boolean>(false);

  // 시스템 테마 감지하여 초기 코드 뷰어 테마 설정
  const systemDarkMode = useThemeDetection();

  useEffect(() => {
    setCodeDarkMode(systemDarkMode);
  }, [systemDarkMode]);

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
    setSelectedFile({
      name: fileName,
      content: sampleApiResponse.data[folder][fileName],
      path: createFilePath(folder, fileName),
    });
  };

  /**
   * 프로젝트 다운로드 핸들러
   */
  const handleDownload = async (): Promise<void> => {
    try {
      await downloadProject();
      alert("프로젝트 다운로드가 완료되었습니다.");
    } catch (error) {
      console.error("다운로드 중 오류 발생:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  /**
   * 새 프로젝트 생성 핸들러
   */
  const handleCreateNew = async (): Promise<void> => {
    try {
      await createNewProject();
      // 새 프로젝트 생성 페이지로 이동하는 로직 추가
    } catch (error) {
      console.error("프로젝트 생성 중 오류 발생:", error);
      alert("프로젝트 생성 중 오류가 발생했습니다.");
    }
  };

  // 파일 개수 계산
  const fileCount = countFiles(sampleApiResponse.data);

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-900">
      <ProjectHeader />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 bg-gray-50 border-gray-200 border-r overflow-y-auto p-2">
          <FileExplorer
            data={sampleApiResponse.data}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
            selectedFile={selectedFile}
            selectFile={selectFile}
          />

          <ProjectStats
            status={sampleApiResponse.status}
            message={sampleApiResponse.message}
            fileCount={fileCount}
          />
        </div>

        <div className="flex-1 flex flex-col">
          <CodeViewer
            selectedFile={selectedFile}
            codeDarkMode={codeDarkMode}
            setCodeDarkMode={setCodeDarkMode}
          />

          <ActionBar
            onDownload={handleDownload}
            onCreateNew={handleCreateNew}
          />
        </div>
      </div>
    </div>
  );
};

export default BuildPreviewPage;
