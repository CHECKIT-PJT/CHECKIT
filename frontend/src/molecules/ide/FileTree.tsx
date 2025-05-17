import { LuFolder, LuFolderOpen, LuFile } from 'react-icons/lu';
import { useState } from 'react';

interface FileNode {
  path: string;
  type: 'file' | 'folder';
  content: string | null;
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  onFileClick: (file: FileNode) => void;
  branch: string;
  root: string;
}

const FileTree = ({
  files,
  selectedFile,
  onFileClick,
  branch,
  root,
}: FileTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  if (!files || files.length === 0) {
    return (
      <div className="p-4 text-gray-500 flex items-center justify-center h-full italic">
        파일이 없습니다
      </div>
    );
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  // 파일 확장자에 따라 색상 결정하는 함수
  const getFileIconColor = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'text-yellow-400';
      case 'css':
      case 'scss':
      case 'sass':
        return 'text-blue-400';
      case 'html':
        return 'text-orange-500';
      case 'json':
        return 'text-green-400';
      case 'md':
        return 'text-purple-400';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'svg':
        return 'text-pink-400';
      default:
        return 'text-blue-500';
    }
  };

  // 폴더 안에 폴더나 파일이 하나만 있을 때 경로를 이어서 한 줄로 보여주는 함수
  const getSinglePath = (files: FileNode[], folder: FileNode) => {
    let path = getFileName(folder.path);
    let current = folder;
    let children = files.filter(
      f =>
        f.path.startsWith(current.path + '/') &&
        f.path.substring(current.path.length + 1).split('/').length === 1
    );
    while (children.length === 1 && children[0].type === 'folder') {
      current = children[0];
      path += '/' + getFileName(current.path);
      children = files.filter(
        f =>
          f.path.startsWith(current.path + '/') &&
          f.path.substring(current.path.length + 1).split('/').length === 1
      );
    }
    return { path, lastFolder: current, children };
  };

  const renderFileTree = (files: FileNode[], currentPath: string = '') => {
    const currentFiles = files.filter(file => {
      const filePath = file.path;
      if (currentPath === '') {
        return !filePath.includes('/');
      }
      return (
        filePath.startsWith(currentPath + '/') &&
        filePath.substring(currentPath.length + 1).split('/').length === 1
      );
    });

    // 폴더를, 파일을 먼저 정렬
    const sortedFiles = [...currentFiles].sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return getFileName(a.path).localeCompare(getFileName(b.path));
    });

    return sortedFiles.map((file, index) => {
      if (file.type === 'folder') {
        // 폴더 안에 폴더나 파일이 하나만 있을 때 경로를 이어서 한 줄로 보여줌
        const {
          path: singlePath,
          lastFolder,
          children,
        } = getSinglePath(files, file);
        const isExpanded = expandedFolders.has(lastFolder.path);
        return (
          <div key={index} className="pl-2 py-1">
            <div
              className={`cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-150 ${
                selectedFile === lastFolder.path
                  ? 'bg-blue-50 dark:bg-gray-600 font-medium'
                  : ''
              }`}
              onClick={() => toggleFolder(lastFolder.path)}
            >
              <div className="w-5 mr-2 flex-shrink-0">
                {isExpanded ? (
                  <LuFolderOpen className="text-yellow-500" />
                ) : (
                  <LuFolder className="text-yellow-500" />
                )}
              </div>
              <span className="text-sm truncate">{singlePath}</span>
            </div>
            {isExpanded && children.length > 0 && (
              <div className="ml-4 border-l border-gray-200 dark:border-gray-700 mt-1">
                {renderFileTree(files, lastFolder.path)}
              </div>
            )}
          </div>
        );
      }
      // 파일 렌더링
      const fileName = getFileName(file.path);
      return (
        <div key={index} className="pl-2 py-1">
          <div
            className={`cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-150 ${
              selectedFile === file.path
                ? 'bg-blue-50 dark:bg-gray-600 font-medium'
                : ''
            }`}
            onClick={() => onFileClick(file)}
          >
            <div className="w-5 mr-2 flex-shrink-0">
              <LuFile className={getFileIconColor(fileName)} />
            </div>
            <span className="text-sm truncate">{fileName}</span>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="w-full border border-gray-200 dark:border-gray-700  overflow-hidden shadow-sm bg-white h-full">
      <div className="h-full overflow-y-auto overflow-x-auto p-2 bg-white dark:bg-gray-900">
        <p className="text-lg font-bold pl-4 pb-2 border-b-2"> Files</p>
        {renderFileTree(files)}
      </div>
    </div>
  );
};

export default FileTree;
