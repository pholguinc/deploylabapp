export type CourseLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export type Course = Readonly<{
  id: string;
  title: string;
  category: string;
  description: string;
  level: CourseLevel;
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  instructor: string | { id: string; name: string; lastname: string; email: string } | null;
  accentColor: string;
  imageUrl?: string;
  features?: string[];
  iconName?: string;
}>;

export type DetailTabKey = 'syllabus' | 'resources' | 'comments' | 'exams';

export type CourseResource = {
  id: string;
  title: string;
  type: 'pdf' | 'code' | 'repo' | 'yaml';
  size: string;
  description: string;
};

export type CommentItem = {
  id: string;
  author: string;
  avatarText: string;
  role?: 'instructor' | 'student';
  timestamp: string;
  content: string;
  likes: number;
  isLiked?: boolean;
};

export type LessonQuiz = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  passingScore: string;
};

export type VideoLesson = {
  id: string;
  title: string;
  duration: string;
  durationSec: number;
  videoQuality: string;
  videoUrl?: string | null;
  isCompleted?: boolean;
  resources: CourseResource[];
  initialComments: CommentItem[];
  quiz: LessonQuiz;
};

export type CourseModule = {
  id: string;
  title: string;
  lessons: VideoLesson[];
};
