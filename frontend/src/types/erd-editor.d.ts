import '@dineug/erd-editor';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'erd-editor': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          value?: string;
          enableThemeBuilder?: string;
          systemDarkMode?: string;
          style?: React.CSSProperties;
        },
        HTMLElement
      >;
    }
  }
}

export interface ErdEditorElement extends HTMLElement {
  value: string;
  setPresetTheme: (theme: {
    appearance: string;
    grayColor: string;
    accentColor: string;
  }) => void;
}
