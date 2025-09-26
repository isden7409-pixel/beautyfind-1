import { useState, useEffect } from 'react';
import { salonService, masterService, reviewService } from '../firebase/services';
import { Salon, Master, Review } from '../types';

// Hook for salons
export const useSalons = () => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salonService.getAll();
      setSalons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  return { salons, loading, error, refetch: fetchSalons };
};

// Hook for masters
export const useMasters = () => {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMasters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await masterService.getAll();
      setMasters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch masters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMasters();
  }, []);

  return { masters, loading, error, refetch: fetchMasters };
};

// Hook for salon by ID
export const useSalon = (id: string) => {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalon = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await salonService.getById(id);
      setSalon(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch salon');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSalon();
    }
  }, [id]);

  return { salon, loading, error, refetch: fetchSalon };
};

// Hook for master by ID
export const useMaster = (id: string) => {
  const [master, setMaster] = useState<Master | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaster = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await masterService.getById(id);
      setMaster(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch master');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMaster();
    }
  }, [id]);

  return { master, loading, error, refetch: fetchMaster };
};

// Hook for reviews
export const useReviews = (type: 'salon' | 'master', id: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type === 'salon' 
        ? await reviewService.getBySalon(id)
        : await reviewService.getByMaster(id);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [type, id]);

  const addReview = async (review: Omit<Review, 'id'>) => {
    try {
      const newReviewId = await reviewService.create(review);
      await fetchReviews(); // Refresh reviews
      return newReviewId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add review');
      throw err;
    }
  };

  return { reviews, loading, error, addReview, refetch: fetchReviews };
};

