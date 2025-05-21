import { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { LuMoon, LuSun, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import FileTree from './FileTree';
import { IoArrowBack } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import { useGitPush } from '../../api/gitAPI';
import { fetchCodeSuggestion } from '../../api/suggestAPI';
import CustomFalseAlert from '../layout/CustomFalseAlert';
import Dialog from '../buildpreview/Dialog';
import CustomAlert from '../layout/CustomAlert';
import type { editor } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { FaCodeCommit } from 'react-icons/fa6';

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
  const [code, setCode] = useState<string>('// 파일을 선택하세요.');
  const [isFileTreeVisible, setIsFileTreeVisible] = useState(true);
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-light');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [showNoChangesAlert, setShowNoChangesAlert] = useState(false);
  const [showCommitSuccess, setShowCommitSuccess] = useState(false);
  const [showCommitError, setShowCommitError] = useState(false);
  const [showGitConfigError, setShowGitConfigError] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const lastCursorLine = useRef<number | null>(null);
  const [showCommitModal, setShowCommitModal] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const originalContentRef = useRef<Map<string, string>>(new Map());
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const gitPush = useGitPush(Number(projectId));
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const suggestionRef = useRef<string | null>(null);
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && selectedFile && gitData) {
      setCode(value);
      const updatedFiles = gitData.files.map(file =>
        file.path === selectedFile ? { ...file, content: value } : file
      );
      gitData.files = updatedFiles;
    }
  };

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    const triggerSuggestion = async (position: monaco.Position) => {
      const model = editor.getModel();
      if (!model || !projectId) return;

      const code = model.getValue();
      try {
        const response = await fetchCodeSuggestion(Number(projectId), {
          code,
          cursorLine: position.lineNumber,
          cursorColumn: position.column,
        });

        console.log(response);
        const suggestionText = response.result.suggestion;
        if (!suggestionText?.trim()) {
          setSuggestion(null);
          suggestionRef.current = null;
          return;
        }

        setSuggestion(suggestionText);
        suggestionRef.current = suggestionText;

        editorRef.current?.trigger(
          'inlineSuggestionTrigger',
          'editor.action.inlineSuggest.trigger',
          {}
        );
      } catch (err) {
        console.error('자동완성 실패:', err);
      }
    };

    const handleCursorActivity = (position: monaco.Position) => {
      const currentLine = position.lineNumber;

      if (lastCursorLine.current !== currentLine) {
        lastCursorLine.current = currentLine;
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
          triggerSuggestion(position);
        }, 2000);
      }
      // 같은 줄에 머무르면 아무 것도 하지 않음
    };

    editor.onDidChangeCursorPosition(e => {
      handleCursorActivity(e.position);
    });

    editor.onDidChangeCursorSelection(e => {
      handleCursorActivity(e.selection.getPosition());
    });

    editor.onDidChangeModel(() => {
      setSuggestion(null);
      suggestionRef.current = null;
      lastCursorLine.current = null;

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    });

    editor.addCommand(monacoInstance.KeyCode.Tab, () => {
      const currentSuggestion = suggestionRef.current;
      if (!currentSuggestion || !editorRef.current) return;
      const pos = editorRef.current.getPosition();
      if (!pos) return;

      editorRef.current.executeEdits('', [
        {
          range: new monacoInstance.Range(
            pos.lineNumber,
            pos.column,
            pos.lineNumber,
            pos.column
          ),
          text: currentSuggestion,
          forceMoveMarkers: true,
        },
      ]);
      setSuggestion(null);
      suggestionRef.current = null;
    });

    monacoInstance.languages.registerInlineCompletionsProvider('java', {
      provideInlineCompletions: (model, position) => {
        const currentSuggestion = suggestionRef.current;
        if (!currentSuggestion?.trim()) {
          return { items: [], dispose: () => {} };
        }

        return {
          items: [
            {
              insertText: currentSuggestion,
              range: new monacoInstance.Range(
                position.lineNumber,
                position.column,
                position.lineNumber,
                position.column
              ),
            },
          ],
          dispose: () => {
            suggestionRef.current = null;
          },
        };
      },
      handleItemDidShow: () => {},
      freeInlineCompletions: () => {},
    });
  };

  const onClickBack = () => navigate(`/project/${projectId}`);
  const toggleTheme = () =>
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));

  const handleFileClick = (file: FileNode) => {
    if (file.type === 'file' && file.content !== null) {
      setSelectedFile(file.path);
      setCode(file.content);
      originalContentRef.current.set(file.path, file.content);

      setSuggestion(null);
      suggestionRef.current = null;

      // 디바운스 타이머가 있다면 취소
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }

      // 커서 위치 초기화
      lastCursorLine.current = null;
    }
  };

  const onCommit = async () => {
    if (!gitData) return;
    try {
      const changedFiles = gitData.files.filter(file => {
        if (file.type !== 'file') return false;
        const original = originalContentRef.current.get(file.path);
        return original !== undefined && original !== file.content;
      });

      if (changedFiles.length === 0) return setShowNoChangesAlert(true);

      if (changedFiles.length === 0) {
        setShowNoChangesAlert(true);
        return;
      }

      setShowCommitModal(true);
    } catch (error: any) {
      console.error('커밋 중 오류가 발생했습니다:', error);
      if (error.message === 'Git 설정을 찾을 수 없습니다') {
        setShowGitConfigError(true);
      } else {
        setShowCommitError(true);
      }
    }
  };

  const handleCommitSubmit = async () => {
    if (!gitData) return;

    try {
      const changedFiles = gitData.files.filter(file => {
        if (file.type !== 'file') return false;
        const originalContent = originalContentRef.current.get(file.path);
        return (
          originalContent !== undefined && originalContent !== file.content
        );
      });

      await gitPush.mutateAsync({
        message: commitMessage || '',
        changedFiles: changedFiles,
      });
      setShowCommitSuccess(true);
      setShowCommitModal(false);
    } catch (error: any) {
      console.error('커밋 중 오류:', error);
      if (error.message === 'Git 설정을 찾을 수 없습니다')
        setShowGitConfigError(true);
      else setShowCommitError(true);
    }
  };

  const onTodo = () => {};

  return (
    <div className="relative flex flex-col">
      <div className="pb-4 flex items-center justify-between mb-2">
        <div className="flex items-start">
          <button onClick={onClickBack} className="p-1 pr-3">
            <IoArrowBack className="w-5 h-5 mt-2" />
          </button>
          <h3 className=" mt-2">
            {gitData?.root} <p className="text-slate-400">/ EDIT</p>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-700">AI</span>
          <button
            type="button"
            className={`w-10 h-5 flex items-center rounded-full px-0.5 transition-colors duration-300 ${isAiEnabled ? 'bg-blue-800' : 'bg-gray-300'}`}
            onClick={() => setIsAiEnabled(v => !v)}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAiEnabled ? 'translate-x-5' : 'translate-x-0'}`}
            />
            <span
              className={`ml-[-14px] text-xs font-semibold select-none ${isAiEnabled ? 'text-white' : 'text-gray-600'}`}
              style={{ marginLeft: isAiEnabled ? '-8px' : '3px' }}
            ></span>
          </button>

          <button
            className="px-4 py-1 rounded bg-blue-800 hover:bg-blue-900 text-white shadow"
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
            onMount={handleEditorDidMount}
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
              suggestOnTriggerCharacters: true,
              quickSuggestions: true,
              inlineSuggest: { enabled: true }, // 중요!
            }}
          />
        </div>
      </div>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCommitModal ? '' : 'hidden'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg px-8 py-6 max-w-md w-full mx-4 shadow-xl">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCodeCommit className="w-8 h-8 text-blue-700 dark:text-blue-300" />
          </div>
          <p className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
            커밋 메시지 입력
          </p>
          <textarea
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="설정한 정규식에 맞게 입력하세요."
            className="w-full p-2 mb-2 border border-gray-300 rounded-md  focus:ring-blue-500 focus:border-transparent dark:text-gray-200 resize-none"
          />
          <div className="flex justify-between gap-3">
            <button
              onClick={() => {
                setShowCommitModal(false);
                setCommitMessage('');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition"
            >
              취소하기
            </button>
            <button
              onClick={handleCommitSubmit}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition"
            >
              커밋하기
            </button>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showCommitModal ? '' : 'hidden'}`}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg px-8 py-6 max-w-md w-full mx-4 shadow-xl">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCodeCommit className="w-8 h-8 text-blue-700 dark:text-blue-300" />
          </div>
          <p className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-gray-200">
            커밋 메시지 입력
          </p>
          <textarea
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="설정한 정규식에 맞게 입력하세요."
            className="w-full p-2 mb-2 border border-gray-300 rounded-md  focus:ring-blue-500 focus:border-transparent dark:text-gray-200 resize-none"
          />
          <div className="flex justify-between gap-3">
            <button
              onClick={() => {
                setShowCommitModal(false);
                setCommitMessage('');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition"
            >
              취소하기
            </button>
            <button
              onClick={handleCommitSubmit}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md transition"
            >
              커밋하기
            </button>
          </div>
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
        message={
          '커밋 중 오류가 발생했습니다.\n커밋 메세지를 다시 작성해주세요.'
        }
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
