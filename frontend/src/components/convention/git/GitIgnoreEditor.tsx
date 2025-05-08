import TextArea from './TextArea';

interface GitIgnoreEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const GitIgnoreEditor = ({ content, onChange }: GitIgnoreEditorProps) => {
  return (
    <div className="border rounded p-4 bg-slate-200">
      <TextArea value={content} onChange={onChange} />
    </div>
  );
};

export default GitIgnoreEditor;
