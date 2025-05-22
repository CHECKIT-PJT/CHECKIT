import { create } from 'zustand';
import { ApiDocListItem, ApiDetail } from '../types/apiDocs';

// API 스토어 상태 타입 정의
interface ApiState {
  apiList: ApiDocListItem[];
  currentApiDetail: ApiDetail | null;
  isLoading: boolean;
  error: string | null;
}

// API 스토어 액션 타입 정의
interface ApiActions {
  setApiList: (apiList: ApiDocListItem[]) => void;
  addApiSpec: (apiSpec: ApiDocListItem) => void;
  deleteApiSpec: (apiSpecId: number) => void;

  setCurrentApiDetail: (apiDetail: ApiDetail) => void;
  clearCurrentApiDetail: () => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  resetApiStore: () => void;
}

// 전체 API 스토어 타입
type ApiStore = ApiState & ApiActions;

// 초기 상태 정의
const initialState: ApiState = {
  apiList: [],
  currentApiDetail: null,
  isLoading: false,
  error: null,
};

// Zustand 스토어 생성
const useApiStore = create<ApiStore>(set => ({
  ...initialState,

  setApiList: apiList => set({ apiList }),

  addApiSpec: apiSpec =>
    set(state => ({
      apiList: [...state.apiList, apiSpec],
    })),

  deleteApiSpec: apiSpecId =>
    set(state => ({
      apiList: state.apiList.filter(api => api.apiSpecId !== apiSpecId),
      currentApiDetail:
        state.currentApiDetail?.id === apiSpecId
          ? null
          : state.currentApiDetail,
    })),

  // 현재 API 상세 정보 관리
  setCurrentApiDetail: apiDetail => set({ currentApiDetail: apiDetail }),
  clearCurrentApiDetail: () => set({ currentApiDetail: null }),

  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),
  resetApiStore: () => set(initialState),
}));

export default useApiStore;
