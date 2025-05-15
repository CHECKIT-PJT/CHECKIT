import FolderIcon from '../../components/buildpreview/FolderIcon';
import FolderTreeItem from './FolderTreeItem';
import { ProjectData, SelectedFile, ExpandedFolders } from '../../types';

interface FileExplorerProps {
  data: ProjectData | null;
  expandedFolders: ExpandedFolders;
  toggleFolder: (folderPath: string) => void;
  selectedFile: SelectedFile | null;
  selectFile: (folderPath: string, fileName: string) => void;
}

/**
 * 파일 탐색기 컴포넌트
 */
const FileExplorer: React.FC<FileExplorerProps> = ({
  data,
  expandedFolders,
  toggleFolder,
  selectedFile,
  selectFile,
}) => {
  if (!data) {
    return (
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-500 mb-2 px-2">
          프로젝트 구조
        </div>
        <div className="border rounded bg-white border-gray-200 shadow-sm p-4 text-center text-gray-500">
          데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-500 mb-2 px-2">
        프로젝트 구조
      </div>
      <div className="border rounded bg-white border-gray-200 shadow-sm">
        <div className="p-2 border-b bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <FolderIcon className="mr-2" />
            <span className="font-medium">
              src/main/java/com/example/project
            </span>
          </div>
        </div>

        {Object.entries(data).map(([domainName, folders]) => (
          <FolderTreeItem
            key={domainName}
            folderPath={domainName}
            displayName={domainName}
            files={folders}
            isExpanded={expandedFolders[domainName] || false}
            expandedFolders={expandedFolders} // ✅ 하위 폴더도 접근 가능하게
            onToggle={toggleFolder}
            selectedFile={selectedFile}
            onSelectFile={selectFile}
          />
        ))}
      </div>
    </div>
  );
};

export default FileExplorer;
