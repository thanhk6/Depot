import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: string;
  isSidebarCollapsed: boolean;
  selectedJobId: string | null;
}

const initialState: UiState = {
  activeTab: 'dashboard',
  isSidebarCollapsed: false,
  selectedJobId: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarCollapsed = !state.isSidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setSelectedJobId: (state, action: PayloadAction<string | null>) => {
      state.selectedJobId = action.payload;
    },
  },
});

export const { setActiveTab, toggleSidebar, setSidebarCollapsed, setSelectedJobId } = uiSlice.actions;
export default uiSlice.reducer;
