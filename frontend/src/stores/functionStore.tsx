import { create } from 'zustand';

export interface FunctionalSpec {
  id?: number;
  projectId: number;
  userId: number;
  category: string;
  functionName: string;
  functionDescription: string;
  priority: number;
  successCase: string;
  failCase: string;
  storyPoint: number;
  userName?: string;
}

interface FunctionalSpecState {
  specs: FunctionalSpec[];
  currentSpec: FunctionalSpec | null;
  isLoading: boolean;
  error: string | null;
}

interface FunctionalSpecActions {
  setSpecs: (specs: FunctionalSpec[]) => void;
  addSpec: (spec: FunctionalSpec) => void;
  updateSpec: (spec: FunctionalSpec) => void;
  deleteSpec: (id: number) => void;
  setCurrentSpec: (spec: FunctionalSpec) => void;
  clearCurrentSpec: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetStore: () => void;
}

type FunctionalSpecStore = FunctionalSpecState & FunctionalSpecActions;

const initialState: FunctionalSpecState = {
  specs: [],
  currentSpec: null,
  isLoading: false,
  error: null,
};

const useFunctionalSpecStore = create<FunctionalSpecStore>(set => ({
  ...initialState,

  setSpecs: specs => set({ specs }),
  addSpec: spec => set(state => ({ specs: [...state.specs, spec] })),
  updateSpec: updated =>
    set(state => ({
      specs: state.specs.map(s => (s.id === updated.id ? updated : s)),
    })),
  deleteSpec: id =>
    set(state => ({
      specs: state.specs.filter(s => s.id !== id),
      currentSpec: state.currentSpec?.id === id ? null : state.currentSpec,
    })),

  setCurrentSpec: spec => set({ currentSpec: spec }),
  clearCurrentSpec: () => set({ currentSpec: null }),

  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  resetStore: () => set(initialState),
}));

export default useFunctionalSpecStore;
