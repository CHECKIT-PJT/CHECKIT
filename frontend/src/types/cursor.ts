export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  pageType: 'erd' | 'api' | 'function';
}

export interface RemoteCursorData extends CursorPosition {
  color: string;
  username: string;
} 