import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated as RNAnimated,
  Easing,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Play,
} from 'lucide-react-native';
import ProgressBar from '../../../shared/components/ProgressBar';
import type { Course } from '../../courses/types';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import MyCoursesSkeleton from '../components/MyCoursesSkeleton';

export type EnrolledCourse = Readonly<{
  id: string;
  title: string;
  category: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  currentLesson: string;
  accentColor: string;
  iconName: 'docker' | 'cicd' | 'linux';
  certificateEarned?: boolean;
}>;

export const ENROLLED_COURSES: readonly EnrolledCourse[] = [
  {
    id: 'c-docker',
    title: 'Docker & Contenedores: De Cero a Experto',
    category: 'Docker',
    progress: 0.65,
    completedLessons: 23,
    totalLessons: 36,
    currentLesson: 'Lección 24: Persistencia con Volúmenes y Bind Mounts',
    accentColor: '#0EA5E9',
    iconName: 'docker',
  },
  {
    id: 'c-cicd',
    title: 'CI/CD Automatizado con GitHub Actions & ArgoCD',
    category: 'CI/CD',
    progress: 0.3,
    completedLessons: 12,
    totalLessons: 42,
    currentLesson: 'Lección 13: Secrets, Variables de Entorno y Ambientes',
    accentColor: '#10B981',
    iconName: 'cicd',
  },
  {
    id: 'c-linux',
    title: 'Linux para DevOps & Shell Scripting con Bash',
    category: 'Linux',
    progress: 1.0,
    completedLessons: 30,
    totalLessons: 30,
    currentLesson: '¡Curso completado con éxito!',
    accentColor: '#EC4899',
    iconName: 'linux',
    certificateEarned: true,
  },
];

type Props = Readonly<{
  onExploreCatalog?: () => void;
  onContinueLesson?: (
    course: Course,
    cardLayout?: { x: number; y: number; width: number; height: number },
  ) => void;
  isLoading?: boolean;
}>;

export default function MyCoursesScreen({
  onExploreCatalog,
  onContinueLesson,
  isLoading: isLoadingProp,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [internalLoading, setInternalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loading = isLoadingProp ?? internalLoading;
  const imageRefs = useRef<Record<string, any>>({});

  const headerOpacity = useRef(new RNAnimated.Value(0)).current;
  const headerTranslateY = useRef(new RNAnimated.Value(-12)).current;
  const statsOpacity = useRef(new RNAnimated.Value(0)).current;
  const statsTranslateY = useRef(new RNAnimated.Value(18)).current;
  const coursesOpacity = useRef(new RNAnimated.Value(0)).current;
  const coursesTranslateY = useRef(new RNAnimated.Value(18)).current;
  const exploreOpacity = useRef(new RNAnimated.Value(0)).current;
  const exploreTranslateY = useRef(new RNAnimated.Value(18)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      headerOpacity.setValue(0);
      headerTranslateY.setValue(-12);
      statsOpacity.setValue(0);
      statsTranslateY.setValue(18);
      coursesOpacity.setValue(0);
      coursesTranslateY.setValue(18);
      exploreOpacity.setValue(0);
      exploreTranslateY.setValue(18);

      const makeAnim = (
        opacity: RNAnimated.Value,
        translateY: RNAnimated.Value,
      ) =>
        RNAnimated.parallel([
          RNAnimated.timing(opacity, {
            toValue: 1,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          RNAnimated.timing(translateY, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);

      RNAnimated.stagger(75, [
        makeAnim(headerOpacity, headerTranslateY),
        makeAnim(statsOpacity, statsTranslateY),
        makeAnim(coursesOpacity, coursesTranslateY),
        makeAnim(exploreOpacity, exploreTranslateY),
      ]).start();
    }
  }, [
    loading,
    headerOpacity,
    headerTranslateY,
    statsOpacity,
    statsTranslateY,
    coursesOpacity,
    coursesTranslateY,
    exploreOpacity,
    exploreTranslateY,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
      setRefreshing(false);
    }, 900);
  }, []);

  const handleContinueLesson = (course: EnrolledCourse) => {
    if (course.certificateEarned) {
      Alert.alert(
        'Certificado DevOps Emitido',
        `Completaste exitosamente "${course.title}". Tu certificado de DevOps Engineer está listo en tu perfil.`,
        [{ text: 'Ver en mi perfil' }],
      );
      return;
    }

    const matched = {
      id: course.id,
      title: course.title,
      category: course.category,
      description: '',
      level: 'Intermedio',
      duration: '0h',
      lessonsCount: course.totalLessons,
      studentsCount: 0,
      rating: 5,
      instructor: '',
      accentColor: course.accentColor,
    } as Course;
    if (matched && onContinueLesson) {
      const el = imageRefs.current[course.id];
      if (el) {
        el.measureInWindow(
          (x: number, y: number, width: number, height: number) => {
            if (width > 0 && height > 0) {
              onContinueLesson(matched, {
                x,
                y,
                width,
                height,
              });
            } else {
              onContinueLesson(matched);
            }
          },
        );
      } else {
        onContinueLesson(matched);
      }
    } else {
      Alert.alert(
        'Reanudar lección',
        `Reproduciendo: ${course.currentLesson}`,
        [{ text: 'Continuar viendo' }],
      );
    }
  };

  if (loading && !refreshing) {
    return <MyCoursesSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + 90,
        },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <RNAnimated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <View style={styles.badgeLabel}>
          <GraduationCap size={13} color={colors.primary} />
          <Text style={styles.badgeLabelText}>Área de Estudio</Text>
        </View>
        <Text style={styles.title}>Mis Cursos</Text>
        <Text style={styles.subtitle}>
          Monitorea tu aprendizaje y continúa donde lo dejaste
        </Text>
      </RNAnimated.View>

      {/* Stats Summary Row */}
      <RNAnimated.View
        style={[
          styles.statsRow,
          {
            opacity: statsOpacity,
            transform: [{ translateY: statsTranslateY }],
          },
        ]}
      >
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2</Text>
          <Text style={styles.statLabel}>En curso</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.accent }]}>1</Text>
          <Text style={styles.statLabel}>Completado</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.primary }]}>65</Text>
          <Text style={styles.statLabel}>Lecciones hechas</Text>
        </View>
      </RNAnimated.View>

      {/* Active Courses List */}
      <RNAnimated.View
        style={[
          styles.section,
          {
            opacity: coursesOpacity,
            transform: [{ translateY: coursesTranslateY }],
          },
        ]}
      >
        <Text style={styles.sectionTitle}>Tus Cursos Activos</Text>

        <View style={styles.coursesList}>
          {ENROLLED_COURSES.map(course => {
            const isCompleted = course.progress >= 1;
            return (
              <View key={course.id} style={styles.courseCard}>
                <View style={styles.cardTop}>
                  <View
                    ref={(el: any) => {
                      imageRefs.current[course.id] = el;
                    }}
                    collapsable={false}
                  >
                    <Image
                      source={require('../../../assets/courses/devops_banner.jpg')}
                      style={styles.courseThumb}
                      resizeMode="cover"
                    />
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.badgeRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {course.category}
                        </Text>
                      </View>
                      {isCompleted ? (
                        <View style={styles.certBadge}>
                          <Award size={12} color="#D97706" />
                          <Text style={styles.certBadgeText}>Certificado</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressBlock}>
                  <View style={styles.progressRow}>
                    <Text style={styles.progressLabel}>
                      {course.completedLessons} de {course.totalLessons}{' '}
                      lecciones
                    </Text>
                    <Text style={styles.progressPercent}>
                      {Math.round(course.progress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={course.progress}
                    color={isCompleted ? colors.accent : course.accentColor}
                  />
                </View>

                {/* Current lesson / next action */}
                <View style={styles.currentLessonBlock}>
                  <Text style={styles.currentLessonLabel}>
                    {isCompleted ? 'Estado:' : 'Siguiente lección:'}
                  </Text>
                  <Text style={styles.currentLessonText} numberOfLines={1}>
                    {course.currentLesson}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    isCompleted && styles.completedActionButton,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleContinueLesson(course)}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2
                        size={16}
                        color={colors.accent}
                        strokeWidth={2.2}
                      />
                      <Text style={styles.completedActionText}>
                        Ver Certificado
                      </Text>
                    </>
                  ) : (
                    <>
                      <Play
                        size={14}
                        color={colors.textOnPrimary}
                        fill={colors.textOnPrimary}
                      />
                      <Text style={styles.actionButtonText}>
                        Continuar Lección
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </RNAnimated.View>

      {/* Explore More Banner */}
      <RNAnimated.View
        style={[
          styles.exploreCard,
          {
            opacity: exploreOpacity,
            transform: [{ translateY: exploreTranslateY }],
          },
        ]}
      >
        <View style={styles.exploreTextGroup}>
          <Text style={styles.exploreTitle}>¿Buscas un nuevo reto?</Text>
          <Text style={styles.exploreSubtitle}>
            Explora más de 15 cursos de arquitectura cloud y automatización.
          </Text>
        </View>
        <TouchableOpacity
          style={styles.exploreButton}
          activeOpacity={0.8}
          onPress={onExploreCatalog}
        >
          <Text style={styles.exploreButtonText}>Ver Catálogo</Text>
          <ChevronRight
            size={14}
            color={colors.textOnPrimary}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </RNAnimated.View>
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      gap: spacing.xl,
    },
    header: {
      gap: spacing.xs,
    },
    badgeLabel: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: `${colors.primary}12`,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
      marginBottom: spacing.xs,
    },
    badgeLabelText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    coursesList: {
      gap: spacing.md,
    },
    courseCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
    },
    cardTop: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-start',
    },
    courseThumb: {
      width: 60,
      height: 60,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
    },
    cardHeaderInfo: {
      flex: 1,
      gap: 4,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    categoryBadge: {
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.textMuted,
    },
    certBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#F59E0B16',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    certBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#D97706',
    },
    courseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 20,
    },
    progressBlock: {
      gap: spacing.xs,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    progressPercent: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    currentLessonBlock: {
      backgroundColor: colors.surfaceAlt,
      padding: spacing.sm,
      borderRadius: radius.md,
      gap: 2,
    },
    currentLessonLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    currentLessonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    actionButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.md,
    },
    actionButtonText: {
      color: colors.textOnPrimary,
      fontSize: 13,
      fontWeight: '700',
    },
    completedActionButton: {
      backgroundColor: `${colors.accent}14`,
      borderWidth: 1,
      borderColor: `${colors.accent}30`,
    },
    completedActionText: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
    },
    exploreCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    exploreTextGroup: {
      flex: 1,
      gap: 2,
    },
    exploreTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    exploreSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
    exploreButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
      borderRadius: radius.md,
    },
    exploreButtonText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
  });
