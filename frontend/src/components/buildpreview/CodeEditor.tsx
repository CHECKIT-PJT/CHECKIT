interface CodeEditorProps {
  content: string;
  isDarkMode: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ content, isDarkMode }) => {
  return (
    <div
      className={`flex-1 overflow-auto p-4 ${
        isDarkMode
          ? 'bg-gray-900 text-gray-100'
          : 'bg-white text-gray-900 border border-gray-200'
      }`}
    >
      <pre className="font-mono text-sm whitespace-pre-wrap">
        <code>{content}</code>
      </pre>
    </div>
  );
};

export default CodeEditor;
