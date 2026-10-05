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

export interface CourseDetailResponse extends Partial<Course> {
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
  async toggleLessonComplete(lessonId: string): Promise<{ completed: boolean }> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;

    if (!token) throw new CoursesApiError('No estás autenticado', 401);

    try {
      const res = await fetch(`${ENV.BACKEND_URL}/lessons/${lessonId}/toggle-complete`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
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

      return json?.data ?? json ?? { completed: false };
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      if (err instanceof Error && err.name === 'AbortError') {
        throw new CoursesApiError(
          'Tiempo de espera agotado al actualizar lección',
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

  async getFinalExam(courseId: string): Promise<FinalExamData | null> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;

    try {
      const res = await fetch(`${BASE}/${courseId}/final-exam`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: ctrl.signal,
      });

      if (res.status === 404) return null;
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        return null;
      }
      return json?.data ?? json;
    } catch {
      return null;
    }
  },

  async submitFinalExam(
    courseId: string,
    answers: { questionId: string; selectedOptionId: string }[],
  ): Promise<ExamSubmitResponse> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new CoursesApiError('No estás autenticado', 401);

    try {
      const res = await fetch(`${BASE}/${courseId}/final-exam/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message ?? `Error al enviar examen (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }
      return json?.data ?? json;
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      throw new CoursesApiError('Error de conexión al enviar el examen', 0);
    }
  },

  async getCertificate(courseId: string): Promise<CertificateData | null> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;

    try {
      const res = await fetch(`${BASE}/${courseId}/final-exam/certificate`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: ctrl.signal,
      });

      if (res.status === 404) return null;
      const json = await res.json().catch(() => null);
      if (!res.ok) return null;
      return json?.data ?? json;
    } catch {
      return null;
    }
  },

  async getLastExamAttempt(courseId: string): Promise<ExamAttemptData | null> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;
    if (!token) return null;

    try {
      const res = await fetch(`${BASE}/${courseId}/final-exam/my-attempt`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        signal: ctrl.signal,
      });

      if (res.status === 404) return null;
      const json = await res.json().catch(() => null);
      if (!res.ok) return null;
      return json?.data ?? json;
    } catch {
      return null;
    }
  },

  async submitReview(
    courseId: string,
    data: { rating: number; comment?: string },
  ): Promise<void> {
    const ctrl = withTimeout(API_TIMEOUT_MS);
    const token = useAuthStore.getState().accessToken;
    if (!token) throw new CoursesApiError('No estás autenticado', 401);

    try {
      const res = await fetch(`${BASE}/${courseId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
        signal: ctrl.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message ?? `Error al enviar reseña (${res.status})`;
        throw new CoursesApiError(
          Array.isArray(msg) ? msg.join(', ') : String(msg),
          res.status,
        );
      }
    } catch (err: unknown) {
      if (err instanceof CoursesApiError) throw err;
      throw new CoursesApiError('Error de conexión al enviar la reseña', 0);
    }
  },

  getCertificateDownloadUrl(courseId: string): string {
    const token = useAuthStore.getState().accessToken;
    return `${BASE}/${courseId}/final-exam/certificate/download?token=${token ?? ''}`;
  },

  async notifyCourseCompletedWebhook(payload: {
    courseId: string;
    userId: string;
    score?: number;
    certificateId?: string;
    studentName?: string;
    studentEmail?: string;
    courseTitle?: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${ENV.BACKEND_URL}/webhooks/course-completed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          event: 'course.completed',
          ...payload,
          completedAt: new Date().toISOString(),
        }),
      });
      return await res.json().catch(() => null);
    } catch (e) {
      console.warn('Error invoking course completed webhook:', e);
      return null;
    }
  },
};

export interface FinalExamOption {
  id: string;
  text: string;
}

export interface FinalExamQuestion {
  id: string;
  text: string;
  options: FinalExamOption[];
}

export interface FinalExamData {
  id: string;
  courseId: string;
  title: string;
  questions: FinalExamQuestion[];
}

export interface ExamSubmitResponse {
  score: number;
  total: number;
  passed: boolean;
  certificate?: CertificateData | null;
}

export interface CertificateData {
  id: string;
  userId: string;
  courseId: string;
  score: number;
  issuedAt: string;
  user: {
    id: string;
    name: string | null;
    lastname: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
}

export interface ExamAttemptData {
  id: string;
  examId: string;
  score: number;
  total: number;
  passed: boolean;
  createdAt: string;
}

export default coursesApi;
