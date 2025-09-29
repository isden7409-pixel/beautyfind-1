import { useEffect, useState } from 'react';
import { reviewService } from '../firebase/services';

export function useReviewSummary(type: 'salon' | 'master', id: string | undefined) {
  const [count, setCount] = useState<number>(0);
  const [average, setAverage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const reviews = type === 'salon'
          ? await reviewService.getBySalon(id)
          : await reviewService.getByMaster(id);
        setCount(reviews.length);
        if (reviews.length > 0) {
          const avg = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;
          setAverage(parseFloat(avg.toFixed(1)));
        } else {
          setAverage(0);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id]);

  return { count, average, loading };
}



