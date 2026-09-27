import { ENV } from '../../../shared/config/env';
import type { Course } from '../types';
import { useAuthStore } from '../../auth/store/useAuthStore';

export interface PaginatedCourses {
  data: Course[];
  meta: {
    firstPage: number;
    lastPage: number;
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const BASE = `${ENV.BACKEND_URL}/courses`;
const API_TIMEOUT_MS = 10_000;

export class CoursesApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'CoursesApiError';
    this.statusCode = statusCode;
  }
}

function withTimeout(ms: number): AbortController {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl;
}

export interface ApiQuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
}

export interface ApiQuizQuestion {
  id: string;
  text: string;
  quizId: string;
  options: ApiQuizOption[];
}

export interface ApiQuiz {
  id: string;
  title: string;
  lessonId: string;
  questions?: ApiQuizQuestion[];
}

export interface ApiResource {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  lessonId: string;
}

export interface ApiLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string | null;
  type: string;
  order: number;
  moduleId: string;
  resources?: ApiResource[];
  quizzes?: ApiQuiz[];
}

export interface ApiCourseModule {
  id: string;
  title: string;
  order: number;
  courseId: string;
  lessons?: ApiLesson[];
}

export interface CourseDetailResponse {
  modules: ApiCourseModule[];
}

export const coursesApi = {
  async list(page = 1, limit = 10): Promise<PaginatedCourses> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;

    try {
      const res = await fetch(`${BASE}/list?page=${page}&limit=${limit}`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message ?? `Error del servidor (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }

      const payload: PaginatedCourses =
        json?.data?.data !== undefined ? json.data : json;

      return {
        data: Array.isArray(payload?.data) ? payload.data : [],
        meta: payload?.meta ?? {
          firstPage: 1,
          lastPage: 1,
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        },
      };
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new CoursesApiError(
          'Tiempo de espera agotado al cargar los cursos',
          408,
        );
      }
      const rawMsg = err instanceof Error ? err.message : String(err);
      throw new CoursesApiError(
        `No se pudo conectar con el servidor. Detalle: ${rawMsg}`,
        0,
      );
    }
  },
  async getDetail(id: string): Promise<CourseDetailResponse> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;

    try {
      const res = await fetch(`${BASE}/${id}`, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message ?? `Error del servidor (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }

      return json?.data ?? json ?? { modules: [] };
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new CoursesApiError(
          'Tiempo de espera agotado al cargar los detalles del curso',
          408,
        );
      }
      const rawMsg = err instanceof Error ? err.message : String(err);
      throw new CoursesApiError(
        `No se pudo conectar con el servidor. Detalle: ${rawMsg}`,
        0,
      );
    }
  },
  async enroll(courseId: string): Promise<void> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;

    try {
      const res = await fetch(`${BASE}/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = json?.message ?? `Error del servidor (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new CoursesApiError(
          'Tiempo de espera agotado al inscribirse al curso',
          408,
        );
      }
      const rawMsg = err instanceof Error ? err.message : String(err);
      throw new CoursesApiError(
        `No se pudo conectar con el servidor. Detalle: ${rawMsg}`,
        0,
      );
    }
  },
  async checkEnrollmentStatus(courseId: string): Promise<{ isEnrolled: boolean; progress?: any }> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;

    if (!token) {
      return { isEnrolled: false };
    }

    try {
      const res = await fetch(`${BASE}/${courseId}/enrollment-status`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          return { isEnrolled: false };
        }
        const msg = json?.message ?? `Error del servidor (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }

      return json?.data ?? json ?? { isEnrolled: false };
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new CoursesApiError(
          'Tiempo de espera agotado al verificar inscripción',
          408,
        );
      }
      return { isEnrolled: false };
    }
  },
};

export default coursesApi;
