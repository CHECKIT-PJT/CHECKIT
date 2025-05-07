export interface ErdEditorElement extends HTMLElement {
    getData(): any;
    setData(data: any): void;
    subscribe(callback: (state: any) => void): () => void;

    // ✅ 이 줄 추가!
  setPresetTheme(theme: {
    appearance: 'light' | 'dark';
    grayColor: string;
    accentColor: string;
  }): void;
  }
  