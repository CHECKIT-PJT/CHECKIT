// 리스트 조회
export interface ProjectListDoc {
  projectId: number;
  projectName: string;
  createdAt: string;
}

// 상세 조회
export interface ProjectMember {
  userId: number;
  username: string;
  role: string;
}

export interface ProjectDetailDoc extends ProjectListDoc {
  updatedAt: string;
  projectMembers: ProjectMember[];
}
