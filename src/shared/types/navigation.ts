import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Course } from '../../features/courses/types';

export type CardLayout = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
  startRadiusTop?: number;
  startRadiusBottom?: number;
}>;

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  MainTabs:
    | { initialTab?: 'dashboard' | 'catalog' | 'my-courses' | 'settings' }
    | undefined;
  CourseDetail: {
    course: Course;
    isEnrolled?: boolean;
    cardLayout?: CardLayout;
    autoPlay?: boolean;
    initialLessonId?: string;
  };
};

export type CourseDetailProps = NativeStackScreenProps<
  RootStackParamList,
  'CourseDetail'
>;
export type MainTabsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'MainTabs'
>;
