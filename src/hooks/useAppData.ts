import { useEffect, useCallback } from 'react';
import { salonService, masterService } from '../firebase/services';
import { useAppStore } from '../store/useStore';

// Hook для загрузки данных салонов
export const useSalonsData = () => {
  const {
    salons,
    setSalons,
    isLoadingSalons,
    setLoadingSalons,
    salonsError,
    setSalonsError
  } = useAppStore();

  const fetchSalons = useCallback(async () => {
    try {
      setLoadingSalons(true);
      setSalonsError(null);
      const data = await salonService.getAll();
      setSalons(data);
    } catch (err) {
      setSalonsError(err instanceof Error ? err.message : 'Failed to fetch salons');
    } finally {
      setLoadingSalons(false);
    }
  }, [setLoadingSalons, setSalonsError, setSalons]);

  useEffect(() => {
    if (salons.length === 0) {
      fetchSalons();
    }
  }, [salons.length, fetchSalons]);

  return {
    salons,
    loading: isLoadingSalons,
    error: salonsError,
    refetch: fetchSalons
  };
};

// Hook для загрузки данных мастеров
export const useMastersData = () => {
  const {
    masters,
    setMasters,
    isLoadingMasters,
    setLoadingMasters,
    mastersError,
    setMastersError
  } = useAppStore();

  const fetchMasters = useCallback(async () => {
    try {
      setLoadingMasters(true);
      setMastersError(null);
      const data = await masterService.getAll();
      setMasters(data);
    } catch (err) {
      setMastersError(err instanceof Error ? err.message : 'Failed to fetch masters');
    } finally {
      setLoadingMasters(false);
    }
  }, [setLoadingMasters, setMastersError, setMasters]);

  useEffect(() => {
    if (masters.length === 0) {
      fetchMasters();
    }
  }, [masters.length, fetchMasters]);

  return {
    masters,
    loading: isLoadingMasters,
    error: mastersError,
    refetch: fetchMasters
  };
};

// Hook для работы с выбранным салоном
export const useSalonSelection = () => {
  const { selectedSalon, setSelectedSalon } = useAppStore();

  const selectSalon = (salon: any) => {
    setSelectedSalon(salon);
  };

  const clearSelection = () => {
    setSelectedSalon(null);
  };

  return {
    selectedSalon,
    selectSalon,
    clearSelection
  };
};

// Hook для работы с выбранным мастером
export const useMasterSelection = () => {
  const { selectedMaster, setSelectedMaster } = useAppStore();

  const selectMaster = (master: any) => {
    setSelectedMaster(master);
  };

  const clearSelection = () => {
    setSelectedMaster(null);
  };

  return {
    selectedMaster,
    selectMaster,
    clearSelection
  };
};

// Hook для работы с поиском и фильтрами
export const useSearchAndFilters = () => {
  const { searchFilters, setSearchFilters } = useAppStore();

  const updateFilters = (newFilters: Partial<typeof searchFilters>) => {
    setSearchFilters({ ...searchFilters, ...newFilters });
  };

  const resetFilters = () => {
    setSearchFilters({
      city: 'All',
      service: 'All',
      searchTerm: ''
    });
  };

  return {
    searchFilters,
    updateFilters,
    resetFilters
  };
};
