import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Salon, Master, Language, SearchFilters } from '../types';

interface AppState {
  // Language state
  language: Language;
  setLanguage: (language: Language) => void;
  
  // Data state
  salons: Salon[];
  masters: Master[];
  setSalons: (salons: Salon[]) => void;
  setMasters: (masters: Master[]) => void;
  
  // Search and filters
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  
  // UI state
  currentViewMode: 'salons' | 'masters';
  setCurrentViewMode: (mode: 'salons' | 'masters') => void;
  
  // Selected items
  selectedSalon: Salon | null;
  selectedMaster: Master | null;
  setSelectedSalon: (salon: Salon | null) => void;
  setSelectedMaster: (master: Master | null) => void;
  
  // Loading states
  isLoadingSalons: boolean;
  isLoadingMasters: boolean;
  setLoadingSalons: (loading: boolean) => void;
  setLoadingMasters: (loading: boolean) => void;
  
  // Error states
  salonsError: string | null;
  mastersError: string | null;
  setSalonsError: (error: string | null) => void;
  setMastersError: (error: string | null) => void;
  
  // Actions
  resetState: () => void;
}

const initialState = {
  language: 'cs' as Language,
  salons: [],
  masters: [],
  searchFilters: {
    city: 'All',
    service: 'All',
    searchTerm: ''
  },
  currentViewMode: 'salons' as const,
  selectedSalon: null,
  selectedMaster: null,
  isLoadingSalons: false,
  isLoadingMasters: false,
  salonsError: null,
  mastersError: null
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Language actions
      setLanguage: (language) => set({ language }),
      
      // Data actions
      setSalons: (salons) => set({ salons }),
      setMasters: (masters) => set({ masters }),
      
      // Search and filters actions
      setSearchFilters: (searchFilters) => set({ searchFilters }),
      
      // UI actions
      setCurrentViewMode: (currentViewMode) => set({ currentViewMode }),
      
      // Selection actions
      setSelectedSalon: (selectedSalon) => set({ selectedSalon }),
      setSelectedMaster: (selectedMaster) => set({ selectedMaster }),
      
      // Loading actions
      setLoadingSalons: (isLoadingSalons) => set({ isLoadingSalons }),
      setLoadingMasters: (isLoadingMasters) => set({ isLoadingMasters }),
      
      // Error actions
      setSalonsError: (salonsError) => set({ salonsError }),
      setMastersError: (mastersError) => set({ mastersError }),
      
      // Reset action
      resetState: () => set(initialState)
    }),
    {
      name: 'beautyfind-store',
      partialize: (state) => ({
        language: state.language,
        searchFilters: state.searchFilters,
        currentViewMode: state.currentViewMode
      })
    }
  )
);

// Selectors for better performance
export const useLanguage = () => useAppStore((state) => state.language);
export const useSetLanguage = () => useAppStore((state) => state.setLanguage);

export const useSalons = () => useAppStore((state) => state.salons);
export const useMasters = () => useAppStore((state) => state.masters);
export const useSetSalons = () => useAppStore((state) => state.setSalons);
export const useSetMasters = () => useAppStore((state) => state.setMasters);

export const useSearchFilters = () => useAppStore((state) => state.searchFilters);
export const useSetSearchFilters = () => useAppStore((state) => state.setSearchFilters);

export const useCurrentViewMode = () => useAppStore((state) => state.currentViewMode);
export const useSetCurrentViewMode = () => useAppStore((state) => state.setCurrentViewMode);

export const useSelectedSalon = () => useAppStore((state) => state.selectedSalon);
export const useSelectedMaster = () => useAppStore((state) => state.selectedMaster);
export const useSetSelectedSalon = () => useAppStore((state) => state.setSelectedSalon);
export const useSetSelectedMaster = () => useAppStore((state) => state.setSelectedMaster);

export const useLoadingStates = () => useAppStore((state) => ({
  isLoadingSalons: state.isLoadingSalons,
  isLoadingMasters: state.isLoadingMasters
}));

export const useErrorStates = () => useAppStore((state) => ({
  salonsError: state.salonsError,
  mastersError: state.mastersError
}));
