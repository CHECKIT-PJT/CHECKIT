import { useRef, useEffect } from 'react';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
}

const TextArea = ({ value, onChange }: TextAreaProps) => {
  const lineRef = useRef<HTMLDivElement>(null);

  const lineCount = value.split('\n').length;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  useEffect(() => {
    if (lineRef.current) {
      const editor = document.getElementById('editor-textarea');
      if (editor) {
        lineRef.current.scrollTop = editor.scrollTop;
      }
    }
  }, [value]);

  return (
    <div className="flex font-mono border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-gray-100 text-slate-800">
      <div
        ref={lineRef}
        className="bg-gray-100 text-slate-800 text-right py-2 px-3 select-none"
        style={{
          lineHeight: '1.5',
          width: '3rem',
          overflow: 'hidden',
          height: '20rem',
        }}
      >
        <pre>{lines}</pre>
      </div>

      <textarea
        id="editor-textarea"
        className="w-full h-80 p-2 resize-none bg-transparent text-slate-800 focus:outline-none"
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        style={{
          lineHeight: '1.5',
          fontFamily: 'inherit',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
};

export default TextArea;
