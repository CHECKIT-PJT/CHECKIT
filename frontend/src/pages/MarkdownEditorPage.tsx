import { useState, useEffect, ChangeEvent } from "react";
import { Header } from "../molecules/readme/Header";
import { EditorPanel } from "../molecules/readme/EditorPanel";
import { PreviewPanel } from "../molecules/readme/PreviewPanel";
import { convertMarkdownToHtml } from "../utils/markdown";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

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
  const [fileName, setFileName] = useState("README.md");
  const [html, setHtml] = useState("");

  useEffect(() => {
    setHtml(convertMarkdownToHtml(markdown));
  }, [markdown]);

  // 이벤트 핸들러
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const createNewFile = () => {
    setMarkdown("# 새 마크다운 파일");
    setFileName("NEW_FILE.md");
  };

  const saveFile = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
  };

  const clearEditor = () => {
    if (confirm("에디터 내용을 모두 지우시겠습니까?")) {
      setMarkdown("");
    }
  };
  const navigate = useNavigate();
  const { projectId } = useParams();
  const handleBackClick = () => {
    navigate(`/project/${projectId}`);
  };

  return (
    <div className={`min-h-screen flex flex-col ${"bg-gray-50"}`}>
      <Header
        onCreateNewFile={createNewFile}
        onSaveFile={saveFile}
        onClickBack={handleBackClick}
      />

      <div className="flex flex-1 overflow-hidden gap-5">
        <EditorPanel
          markdown={markdown}
          onMarkdownChange={handleChange}
          onCopyToClipboard={copyToClipboard}
          onClearEditor={clearEditor}
        />

        <PreviewPanel html={html} />
      </div>
    </div>
  );
};

export default MarkdownEditorPage;
