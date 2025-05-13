import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
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

// 필요한 스타일링을 위한 Tailwind CSS 클래스 정의
const tailwindMarkdownStyles = {
  wrapper:
    'prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none break-words',
};

const MarkdownEditorPage: React.FC = () => {
  // 상태 관리
  const [markdown, setMarkdown] = useState(`# 마크다운 에디터

이것은 **실시간** 마크다운 에디터입니다.

## 기능

- 왼쪽에 마크다운 코드 입력
- 오른쪽에 실시간 프리뷰
- TypeScript와 Tailwind CSS 사용
- 생성 및 저장 기능

### 코드 예제

\`\`\`typescript
const greeting = (name: string): string => {
  return \`안녕하세요, \${name}님!\`;
};
\`\`\`

> 마크다운으로 문서를 쉽게 작성하세요!

[깃허브 링크](https://github.com)

---

![이미지 예제](/api/placeholder/400/200)
`);
  const [fileName, setFileName] = useState('README.md');
  const [html, setHtml] = useState('');
  const [showFileNameInput, setShowFileNameInput] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setHtml(convertMarkdownToHtml(markdown));
  }, [markdown]);

  // 테마 변경 시 적용
  useEffect(() => {});

  // 이벤트 핸들러
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const createNewFile = () => {
    setMarkdown('# 새 마크다운 파일');
    setFileName('NEW_FILE.md');
    setShowFileNameInput(true);
  };

  const saveFile = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('파일이 저장되었습니다!');
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

  const navigate = useNavigate();
  const { projectId } = useParams();

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

  // 마크다운의 첫 번째 헤더를 가져오는 함수
  const getDocumentTitle = () => {
    const match = markdown.match(/^#\s+(.*)$/m);
    return match ? match[1] : '제목 없음';
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${'bg-gray-50 text-gray-800'}`}
    >
      {/* 토스트 메시지 */}
      <div
        id="toast"
        className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 translate-y-2 transform transition-all duration-300 z-50"
      >
        파일이 저장되었습니다!
      </div>

      {/* 상단 헤더 */}
      <div className="bg-white dark:bg-gray-800 transition-colors duration-300">
        {/* 메인 툴바 */}
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
                  <span className="mx-2 text-gray-400">|</span>
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
                createNewFile();
                setIsDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 border-blue hover:bg-gray-200 text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
              title="생성"
            >
              <FaPlus size={16} />
              <span className="hidden sm:inline">생성</span>
            </button>
            <button
              onClick={saveFile}
              className="flex items-center gap-1 px-3 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
              title="파일 저장하기"
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
                      createNewFile();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                  >
                    <FaFile size={16} className="text-green-500" />
                    <span>새 파일</span>
                  </button>

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

      {/* 에디터 및 프리뷰 영역 */}
      <div className="flex flex-1 overflow-hidden pt-4 gap-5">
        {/* 에디터 패널 */}
        <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium flex justify-between items-center transition-colors">
            <span>마크다운 편집</span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {markdown.length} 자
            </div>
          </div>
          <textarea
            value={markdown}
            onChange={handleChange}
            className="flex-1 p-4 resize-none w-full outline-none bg-white dark:bg-gray-800 font-mono text-sm leading-relaxed transition-colors overflow-auto"
            spellCheck="false"
          />
        </div>

        {/* 프리뷰 패널 */}
        <div className="w-1/2 flex flex-col rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg transition-colors">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 font-medium transition-colors">
            미리보기
          </div>
          <div
            className={`flex-1 p-6 overflow-auto bg-white dark:bg-gray-800 transition-colors ${tailwindMarkdownStyles.wrapper}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {/* 하단 상태바 */}
      <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-2 px-4 text-xs text-gray-500 dark:text-gray-400 flex justify-between transition-colors">
        <div>마크다운 에디터</div>
        <div>마지막 수정: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default MarkdownEditorPage;
