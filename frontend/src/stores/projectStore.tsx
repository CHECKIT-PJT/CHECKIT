import { create } from 'zustand';

interface Project {
  projectId: number;
  projectName: string;
  createdAt: string;
}

interface ProjectMember {
  id: number;
  userName: string;
  nickname: string;
  userEmail: string;
  role: string;
}

interface ProjectDetail extends Project {
  projectUpdatedAt: string;
  projectMembers: ProjectMember[];
}

interface ProjectState {
  projects: Project[];
  currentProject: ProjectDetail | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  // 프로젝트 CRUD
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: number, updatedData: Partial<Project>) => void;
  deleteProject: (projectId: number) => void;

  // 프로젝트 detail
  setCurrentProject: (project: ProjectDetail) => void;
  clearCurrentProject: () => void;

  // 멤버
  addMember: (projectId: number, member: ProjectMember) => void;
  updateMember: (
    projectId: number,
    id: number,
    updatedData: Partial<ProjectMember>
  ) => void;
  removeMember: (projectId: number, id: number) => void;

  // Utility functions
  resetProjects: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ProjectStore = ProjectState & ProjectActions;

const useProjectStore = create<ProjectStore>(set => ({
  // 초기 상태
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  // 프로젝트 CRUD
  setProjects: projects => set({ projects }),

  addProject: project =>
    set(state => ({
      projects: [...state.projects, project],
    })),

  updateProject: (projectId, updatedData) =>
    set(state => ({
      projects: state.projects.map(project =>
        project.projectId === projectId
          ? { ...project, ...updatedData }
          : project
      ),
      currentProject:
        state.currentProject?.projectId === projectId
          ? { ...state.currentProject, ...updatedData }
          : state.currentProject,
    })),

  deleteProject: projectId =>
    set(state => ({
      projects: state.projects.filter(
        project => project.projectId !== projectId
      ),
      currentProject:
        state.currentProject?.projectId === projectId
          ? null
          : state.currentProject,
    })),

  // 프로젝트 detail
  setCurrentProject: project => set({ currentProject: project }),
  clearCurrentProject: () => set({ currentProject: null }),

  // 멤버
  addMember: (projectId, member) =>
    set(state => {
      if (
        !state.currentProject ||
        state.currentProject.projectId !== projectId
      ) {
        return state;
      }
      return {
        currentProject: {
          ...state.currentProject,
          projectMembers: [...state.currentProject.projectMembers, member],
        },
      };
    }),

  updateMember: (projectId, id, updatedData) =>
    set(state => {
      if (
        !state.currentProject ||
        state.currentProject.projectId !== projectId
      ) {
        return state;
      }
      return {
        currentProject: {
          ...state.currentProject,
          projectMembers: state.currentProject.projectMembers.map(member =>
            member.id === id ? { ...member, ...updatedData } : member
          ),
        },
      };
    }),

  removeMember: (projectId, id) =>
    set(state => {
      if (
        !state.currentProject ||
        state.currentProject.projectId !== projectId
      ) {
        return state;
      }
      return {
        currentProject: {
          ...state.currentProject,
          projectMembers: state.currentProject.projectMembers.filter(
            member => member.id !== id
          ),
        },
      };
    }),

  resetProjects: () => set({ projects: [], currentProject: null }),
  setLoading: loading => set({ isLoading: loading }),
  setError: error => set({ error }),
}));

export default useProjectStore;
