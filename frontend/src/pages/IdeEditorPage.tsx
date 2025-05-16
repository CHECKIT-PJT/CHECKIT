import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { LuMoon, LuSun } from 'react-icons/lu';

const IdeEditorPage: React.FC = () => {
  const [code, setCode] = useState<string>('// Start coding here...');
  const [theme, setTheme] = useState<'vs-dark' | 'vs-light'>('vs-light');

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'vs-dark' ? 'vs-light' : 'vs-dark'));
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-4 flex items-center justify-end">
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800 shadow"
        >
          {theme === 'vs-dark' ? <LuSun size={16} /> : <LuMoon size={16} />}
        </button>
      </div>
      <div className="flex-1 p-4 pt-0">
        <Editor
          height="90vh"
          defaultLanguage="java"
          defaultValue={code}
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
  );
};

export default IdeEditorPage;
