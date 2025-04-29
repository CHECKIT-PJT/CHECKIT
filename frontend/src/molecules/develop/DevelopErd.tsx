import { useEffect, useRef } from 'react';
import '@dineug/erd-editor';

const DevelopErd = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const existingEditor = ref.current.querySelector('erd-editor');
    if (existingEditor) return;

    const erdEditor = document.createElement('erd-editor');
    erdEditor.style.width = '100%';
    erdEditor.style.height = '100%';

    erdEditor.setAttribute('appearance', 'light');
    erdEditor.setAttribute('enableThemeBuilder', 'false');

    erdEditor.addEventListener('save', (event: any) => {
      console.log('저장된 ERD 데이터:', event.detail);
    });

    ref.current.appendChild(erdEditor);
  }, []);

  return (
    <div ref={ref} style={{ width: '90%', height: '500px' }} className="mt-4" />
  );
};

export default DevelopErd;
