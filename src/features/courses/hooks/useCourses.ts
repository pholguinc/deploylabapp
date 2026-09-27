import { useState, useEffect, useCallback } from 'react';
import { coursesApi, PaginatedCourses } from '../services/coursesApi';
import type { Course } from '../types';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [meta, setMeta] = useState<PaginatedCourses['meta']>({
    firstPage: 1,
    lastPage: 1,
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (page: number = 1, append = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await coursesApi.list(page, 10);
      setCourses(prev => (append ? [...prev, ...response.data] : response.data));
      setMeta(response.meta);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los cursos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const loadMore = useCallback(() => {
    if (!isLoading && meta.currentPage < meta.totalPages) {
      fetchCourses(meta.currentPage + 1, true);
    }
  }, [isLoading, meta, fetchCourses]);

  return {
    courses,
    meta,
    isLoading,
    error,
    refresh: () => fetchCourses(1, false),
    loadMore,
  };
}
