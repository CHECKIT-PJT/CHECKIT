import { useEffect, useRef, useState } from 'react';
import '@dineug/erd-editor';
import { ErdEditorElement } from '@dineug/erd-editor';
import ToggleButton from '../../components/button/ToggleButton';

interface Theme {
  canvas: string;
  table: string;
  tableActive: string;
  focus: string;
  keyPK: string;
  keyFK: string;
  keyPFK: string;
  font: string;
  fontActive: string;
  fontPlaceholder: string;
  contextmenu: string;
  contextmenuActive: string;
  edit: string;
  columnSelect: string;
  columnActive: string;
  minimapShadow: string;
  scrollbarThumb: string;
  scrollbarThumbActive: string;
  menubar: string;
  visualization: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'erd-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<ErdEditorElement>,
        ErdEditorElement
      >;
    }
  }
}

const DevelopErd = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [erdData, setErdData] = useState<any>(null);

  useEffect(() => {
    if (ref.current && !ref.current.querySelector('erd-editor')) {
      const erd = document.createElement('erd-editor') as ErdEditorElement;

      erd.style.width = '100%';
      erd.style.height = '100%';

      erd.setPresetTheme({
        appearance: 'light',
        grayColor: 'slate',
        accentColor: 'blue',
      });

      erd.setAttribute('enableThemeBuilder', 'true');
      erd.setAttribute('systemDarkMode', 'false');

      ref.current.appendChild(erd);

      erd.addEventListener('save', ((e: CustomEvent) => {
        const savedData = e.detail;
        setErdData(savedData);
        console.log('저장된 ERD 데이터:', savedData);
        // TODO: erd 저장 API 호출 필요
      }) as EventListener);
    }
  }, []);

  return (
    <div className="flex flex-col items-center w-full h-full">
      <div className="flex justify-end w-[90%] mb-2">
        <ToggleButton />
      </div>
      <div className="w-[90%] h-[500px]">
        <div ref={ref} className="w-full h-full" />
      </div>
    </div>
  );
};

export default DevelopErd;
