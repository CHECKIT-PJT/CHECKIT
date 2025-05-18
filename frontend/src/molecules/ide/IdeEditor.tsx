import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { LuMoon, LuSun, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import FileTree from './FileTree';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { useGitPush } from '../../api/gitAPI';
import CustomFalseAlert from '../layout/CustomFalseAlert';
import Dialog from '../buildpreview/Dialog';
import CustomAlert from '../layout/CustomAlert';

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

interface IdeEditorProps {
  gitData?: GitData;
}

const IdeEditor = ({ gitData }: IdeEditorProps) => {
  const [code, setCode] = useState<string>(
    '// Select a file to view its contents...'
  );
  const [isFileTreeVisible, setIsFileTreeVisible] = useState(true);
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-light');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showNoChangesAlert, setShowNoChangesAlert] = useState(false);
  const [showCommitSuccess, setShowCommitSuccess] = useState(false);
  const [showCommitError, setShowCommitError] = useState(false);
  const [showGitConfigError, setShowGitConfigError] = useState(false);
  const originalContentRef = useRef<Map<string, string>>(new Map());
  const navigate = useNavigate();
  const { projectId } = useParams();
  const gitPush = useGitPush(Number(projectId));

  const getUserNameFromToken = (): string => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return '사용자';
    try {
      const payload = token.split('.')[1];
      const decodedPayload = decodeURIComponent(
        atob(payload)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      const decoded = JSON.parse(decodedPayload);
      return decoded.nickname || '사용자';
    } catch (err) {
      return '사용자';
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && selectedFile && gitData) {
      setCode(value);
      // 현재 파일의 내용 업데이트
      const updatedFiles = gitData.files.map(file => {
        if (file.path === selectedFile) {
          return { ...file, content: value };
        }
        return file;
      });
      gitData.files = updatedFiles;
    }
  };

  const onClickBack = () => {
    navigate(`/project/${projectId}`);
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file' && file.content !== null) {
      setSelectedFile(file.path);
      setCode(file.content);
      originalContentRef.current.set(file.path, file.content);
    }
  };

  const onCommit = async () => {
    if (!gitData) return;

    try {
      const date = new Date(Date.now() + 9 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      // 변경된 파일만 필터링
      const changedFiles = gitData.files.filter(file => {
        if (file.type !== 'file') return false;
        const originalContent = originalContentRef.current.get(file.path);
        return (
          originalContent !== undefined && originalContent !== file.content
        );
      });

      if (changedFiles.length === 0) {
        setShowNoChangesAlert(true);
        return;
      }

      await gitPush.mutateAsync({
        message: `feat: 코드 수정 (${date}) - ${getUserNameFromToken()}`,
        changedFiles: changedFiles,
      });
      setShowCommitSuccess(true);
    } catch (error: any) {
      console.error('커밋 중 오류가 발생했습니다:', error);
      if (error.message === 'Git 설정을 찾을 수 없습니다') {
        setShowGitConfigError(true);
      } else {
        setShowCommitError(true);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="py-4 flex items-center justify-between mb-2">
        <div className="flex items-start">
          <button onClick={onClickBack} className="p-1 pr-3">
            <IoArrowBack className="w-5 h-5 mt-2" />
          </button>
          <div>
            <p className="text-xl font-bold mt-2">{gitData?.root}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 shadow"
            onClick={onCommit}
          >
            commit하기
          </button>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 shadow"
          >
            {theme === 'vs-dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
          </button>
        </div>
      </div>
      <div className="flex-1 flex gap-4">
        {gitData && gitData.files && (
          <div
            className={`${isFileTreeVisible ? 'w-1/4' : 'w-0'} transition-all duration-300 border-r border-gray-200 dark:border-gray-700 h-[75vh] relative`}
          >
            <button
              onClick={() => setIsFileTreeVisible(!isFileTreeVisible)}
              className="absolute -right-4 mt-5 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md border border-gray-200 dark:border-gray-700 z-10"
            >
              {isFileTreeVisible ? (
                <LuChevronLeft size={16} />
              ) : (
                <LuChevronRight size={16} />
              )}
            </button>
            <div
              className={`${isFileTreeVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 h-full`}
            >
              <FileTree
                files={gitData.files}
                selectedFile={selectedFile}
                onFileClick={handleFileClick}
                branch={gitData.branch}
                root={gitData.root}
              />
            </div>
          </div>
        )}
        <div
          className={`${isFileTreeVisible ? 'w-3/4' : 'w-full'} transition-all duration-300 pt-0 h-[75vh]`}
        >
          <Editor
            height="100%"
            defaultLanguage="java"
            value={code}
            theme={theme}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>

      {/* 커스텀 알람 띄우기 */}
      <CustomFalseAlert
        isOpen={showNoChangesAlert}
        title="변경 사항 없음"
        message="파일을 변경 후 커밋해주세요."
        confirmText="확인"
        onConfirm={() => setShowNoChangesAlert(false)}
      />

      <CustomAlert
        isOpen={showCommitSuccess}
        title="커밋 성공"
        message="변경 사항이 성공적으로 커밋되었습니다."
        confirmText="확인"
        onConfirm={() => setShowCommitSuccess(false)}
      />

      <CustomFalseAlert
        isOpen={showCommitError}
        title="커밋 실패"
        message="커밋 중 오류가 발생했습니다. 다시 시도해주세요."
        confirmText="확인"
        onConfirm={() => setShowCommitError(false)}
      />

      <Dialog
        isOpen={showGitConfigError}
        title="Git 설정 필요"
        message="Git 설정을 찾을 수 없습니다. Convention을 먼저 설정해주세요."
        confirmText="설정하러 가기"
        onConfirm={() => navigate(`/project/${projectId}/build/option/commit`)}
        onCancel={() => setShowGitConfigError(false)}
      />
    </div>
  );
};

export default IdeEditor;
