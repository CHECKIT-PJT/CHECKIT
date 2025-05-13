export interface FuncListItem {
  userId: number;
  funcId: number;
  funcName: string;
  category: string;
  assignee: string;
  storyPoints: number;
  priority: string;
}

export interface FuncDetail {
  funcName: string;
  category: string;
  assignee: string;
  storyPoints: number;
  priority: string;
  description: string;
  successCase: string;
  failCase: string;
}
