export interface ErdEditorElement extends HTMLElement {
  getData(): any;
  setData(data: any): void;
  subscribe(callback: (state: any) => void): () => void;
  value: string;
  setPresetTheme: (theme: {
    appearance: string;
    grayColor: string;
    accentColor: string;
  }) => void;
}
