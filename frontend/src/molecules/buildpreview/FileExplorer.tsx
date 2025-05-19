import FolderIcon from '../../components/buildpreview/FolderIcon';
import FolderTreeItem from './FolderTreeItem';
import FileTreeItem from './FileTreeItem'; // ⬅️ 루트 파일도 위해 import
import { ProjectData, SelectedFile, ExpandedFolders } from '../../types';

interface FileExplorerProps {
  data: ProjectData | null;
  expandedFolders: ExpandedFolders;
  toggleFolder: (folderPath: string) => void;
  selectedFile: SelectedFile | null;
  selectFile: (folderPath: string, fileName: string) => void;
  rootPackage?: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  data,
  expandedFolders,
  toggleFolder,
  selectedFile,
  selectFile,
  rootPackage,
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

  const rootPath = rootPackage
    ? `src/main/java/${rootPackage.replace(/\./g, '/')}`
    : 'src/main/java/com/example/project';

  // 📦 폴더와 파일 분리
  const folders: Record<string, any> = {};
  const files: Record<string, string> = {};

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      folders[key] = value;
    } else {
      files[key] = value;
    }
  });

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-500 mb-2 px-2">
        프로젝트 구조
      </div>
      <div className="border rounded bg-white border-gray-200 shadow-sm">
        <div className="p-2 border-b bg-gray-50 border-gray-200">
          <div className="flex items-center">
            <FolderIcon className="mr-2" />
            <span className="font-medium">{rootPath}</span>
          </div>
        </div>

        {Object.entries(files).map(([fileName, content]) => (
          <FileTreeItem
            key={fileName}
            fileName={fileName}
            isSelected={selectedFile?.path === fileName}
            onClick={() => selectFile('', fileName)}
          />
        ))}

        {Object.entries(folders).map(([domainName, folders]) => (
          <FolderTreeItem
            key={domainName}
            folderPath={domainName}
            displayName={domainName}
            files={folders}
            isExpanded={expandedFolders[domainName] || false}
            expandedFolders={expandedFolders}
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
