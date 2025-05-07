import TextArea from './TextArea';

interface GitIgnoreEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const GitIgnoreEditor = ({ content, onChange }: GitIgnoreEditorProps) => {
  return (
    <div className="border rounded p-2 bg-gray-100">
      <TextArea value={content} onChange={onChange} />
    </div>
  );
};

export default GitIgnoreEditor;
