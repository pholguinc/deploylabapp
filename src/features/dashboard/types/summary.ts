/** Resumen de aprendizaje del usuario autenticado (GET /reports/me). */
export interface MySummary {
  enrolledCourses: number;
  completedCourses: number;
  avgProgress: number;
  completedLessons: number;
  certificates: number;
  examAttempts: number;
  passedExams: number;
  pendingPracticalReviews: number;
  avgExamScore: number | null;
}
