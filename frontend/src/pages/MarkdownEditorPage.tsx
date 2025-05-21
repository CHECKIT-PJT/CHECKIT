import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { convertMarkdownToHtml } from '../utils/markdown';
import {
  FaSave,
  FaCopy,
  FaTrashAlt,
  FaChevronDown,
  FaFile,
  FaPlus,
} from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import {
  generateReadme,
  saveReadme,
  getReadme,
  updateReadme,
} from '../api/readmeAPI';
import Loading from '../molecules/layout/loading';

const tailwindMarkdownStyles = {
  wrapper:
    'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none break-words',
};

const MarkdownEditorPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const pid = Number(projectId);
  const navigate = useNavigate();

  const [markdown, setMarkdown] = useState('');
  const [fileName, setFileName] = useState('README.md');
  const [html, setHtml] = useState('');
  const [showFileNameInput, setShowFileNameInput] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [readmeExists, setReadmeExists] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setHtml(convertMarkdownToHtml(markdown));
  }, [markdown]);

  useEffect(() => {
    if (!pid) return;

    const fetchReadme = async () => {
      try {
        const content = await getReadme(pid);
        if (content) {
          setMarkdown(content);
          setReadmeExists(true);
        } else {
          setReadmeExists(false);
        }
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setReadmeExists(false);
        } else {
          setReadmeExists(true);
          console.warn('README 불러오기 실패:', err);
        }
      }
    };

    fetchReadme();
  }, [pid]);

  const handleGenerateReadme = async () => {
    setIsLoading(true);

    try {
      const result = await generateReadme(pid);
      console.log('생성된 readme', result);
      if (result) {
        setMarkdown(result);
      }
    } catch (err) {
      console.error('README 생성 실패:', err);
      showToast('README 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOrUpdateReadme = async () => {
    try {
      if (readmeExists) {
        await updateReadme(pid, markdown);
        showToast('README가 수정되었습니다!');
      } else {
        await saveReadme(pid, markdown);
        setReadmeExists(true);
        showToast('README가 생성되었습니다!');
      }
    } catch (err: any) {
      const errorCode = err?.response?.data?.code;

      if (errorCode === 'README_ALREADY_EXISTS') {
        try {
          await updateReadme(pid, markdown);
          setReadmeExists(true);
          showToast('이미 존재하여 수정되었습니다!');
        } catch (updateError) {
          console.error('README fallback 업데이트 실패:', updateError);
          showToast('README 수정 중 오류가 발생했습니다.');
        }
      } else {
        console.error('README 저장/수정 실패:', err);
        showToast('README 저장 중 오류가 발생했습니다.');
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const showToast = (message: string) => {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
      setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-2');
      }, 3000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown).then(() => {
      showToast('클립보드에 복사되었습니다!');
    });
  };

  const clearEditor = () => {
    if (window.confirm('에디터 내용을 모두 지우시겠습니까?')) {
      setMarkdown('');
    }
  };

  const handleBackClick = () => {
    navigate(`/project/${projectId}`);
  };

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const handleFileNameBlur = () => {
    setShowFileNameInput(false);
  };

  const handleFileNameClick = () => {
    setShowFileNameInput(true);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const getDocumentTitle = () => {
    const match = markdown.match(/^#\s+(.*)$/m);
    return match ? match[1] : '';
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-20 backdrop-blur-sm">
          <Loading />
        </div>
      )}
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 transition-colors">
        <div
          id="toast"
          className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 translate-y-2 transform transition-all duration-300 z-50"
        >
          파일이 저장되었습니다!
        </div>

        <div className="bg-white dark:bg-gray-800 transition-colors">
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackClick}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                title="프로젝트로 돌아가기"
              >
                <IoArrowBack size={20} />
              </button>

              <div className="flex items-center gap-2">
                <FaFile size={20} className="text-blue-500" />
                {showFileNameInput ? (
                  <input
                    type="text"
                    value={fileName}
                    onChange={handleFileNameChange}
                    onBlur={handleFileNameBlur}
                    autoFocus
                    className="border dark:border-gray-600 rounded px-2 py-1 text-sm font-medium bg-transparent focus:border-blue-500 focus:outline-none transition-colors w-48"
                  />
                ) : (
                  <div
                    onClick={handleFileNameClick}
                    className="font-medium cursor-pointer hover:text-blue-500 transition-colors flex items-center"
                  >
                    <span className="truncate max-w-xs">{fileName}</span>
                    <span className="text-gray-500 dark:text-gray-400 truncate font-normal">
                      {getDocumentTitle()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  handleGenerateReadme();
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 border-blue hover:bg-gray-200 text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
                title="README 생성"
              >
                <FaPlus size={16} />
                <span className="hidden sm:inline">생성</span>
              </button>

              <button
                onClick={handleSaveOrUpdateReadme}
                className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
                title={readmeExists ? 'README 수정' : 'README 생성'}
              >
                <FaSave size={16} />
                <span className="hidden sm:inline">저장</span>
              </button>

              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  <span className="hidden sm:inline">더 보기</span>
                  <FaChevronDown size={16} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-1 py-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={() => {
                        copyToClipboard();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <FaCopy size={16} className="text-blue-500" />
                      <span>클립보드에 복사</span>
                    </button>

                    <button
                      onClick={() => {
                        clearEditor();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                      <FaTrashAlt size={16} className="text-red-500" />
                      <span>내용 지우기</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden pt-4 gap-5">
          <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium">
              마크다운 편집
            </div>
            <textarea
              value={markdown}
              onChange={handleChange}
              className="flex-1 p-4 resize-none w-full outline-none bg-white dark:bg-gray-800 font-mono text-sm leading-relaxed transition-colors overflow-auto"
              spellCheck="false"
            />
          </div>

          <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium">
              미리보기
            </div>
            <div
              className={`flex-1 p-6 overflow-auto bg-white dark:bg-gray-800 transition-colors ${tailwindMarkdownStyles.wrapper}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between transition-colors">
          <div>마크다운 에디터</div>
          <div>마지막 수정: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </>
  );
};

export default MarkdownEditorPage;
