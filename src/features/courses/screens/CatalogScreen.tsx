import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SharedTransition } from 'react-native-reanimated';

export const courseSharedTransition =
  SharedTransition.duration(550).springify();
import {
  Animated as RNAnimated,
  Easing,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BookOpen,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Search,
  Star,
} from 'lucide-react-native';

import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
const CATEGORIES = [
  'Todos',
  'DevOps',
  'Cloud',
  'Infraestructura',
  'Desarrollo',
  'Seguridad',
];
import type { Course } from '../types';
import CatalogSkeleton from '../components/CatalogSkeleton';
import { useCourses } from '../hooks/useCourses';
import { coursesApi } from '../services/coursesApi';

export { type Course };

type Props = Readonly<{
  onSelectCourse?: (
    course: Course,
    cardLayout?: { x: number; y: number; width: number; height: number },
  ) => void;
  isLoading?: boolean;
}>;

export default function CatalogScreen({
  onSelectCourse,
  isLoading: isLoadingProp,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [enrolledCourses, setEnrolledCourses] = useState<
    Record<string, boolean>
  >({});
  const [completedCourses, setCompletedCourses] = useState<
    Record<string, boolean>
  >({});
  const imageRefs = useRef<Record<string, any>>({});

  const { courses, isLoading: apiLoading, refresh } = useCourses();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      async function checkEnrollments() {
        if (!courses.length) return;
        try {
          const results = await Promise.all(
            courses.map(c =>
              coursesApi
                .checkEnrollmentStatus(c.id)
                .catch(() => ({ isEnrolled: false, progress: null })),
            ),
          );
          if (!mounted) return;
          const newEnrolled: Record<string, boolean> = {};
          const newCompleted: Record<string, boolean> = {};

          courses.forEach((c, i) => {
            const res = results[i];
            if (res?.isEnrolled) {
              newEnrolled[c.id] = true;
            }
            if (
              res?.progress?.status === 'COMPLETED' ||
              (typeof res?.progress?.progress === 'number' &&
                res.progress.progress >= 100)
            ) {
              newCompleted[c.id] = true;
            }
          });

          // Also check certificates for enrolled courses to ensure completed state
          const enrolledToCheck = courses.filter(
            c => newEnrolled[c.id] && !newCompleted[c.id],
          );
          if (enrolledToCheck.length > 0) {
            const certResults = await Promise.all(
              enrolledToCheck.map(c =>
                coursesApi
                  .getCertificate(c.id)
                  .then(cert => !!cert)
                  .catch(() => false),
              ),
            );
            if (mounted) {
              enrolledToCheck.forEach((c, idx) => {
                if (certResults[idx]) {
                  newCompleted[c.id] = true;
                }
              });
            }
          }

          if (mounted) {
            setEnrolledCourses(newEnrolled);
            setCompletedCourses(newCompleted);
          }
        } catch (err) {
          console.warn('Error fetching enrollments', err);
        }
      }
      checkEnrollments();
      return () => {
        mounted = false;
      };
    }, [courses]),
  );
  const [internalLoading, setInternalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loading = isLoadingProp ?? (internalLoading || apiLoading);

  const headerOpacity = useRef(new RNAnimated.Value(0)).current;
  const headerTranslateY = useRef(new RNAnimated.Value(-12)).current;
  const categoriesOpacity = useRef(new RNAnimated.Value(0)).current;
  const categoriesTranslateY = useRef(new RNAnimated.Value(18)).current;
  const coursesOpacity = useRef(new RNAnimated.Value(0)).current;
  const coursesTranslateY = useRef(new RNAnimated.Value(18)).current;

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
      categoriesOpacity.setValue(0);
      categoriesTranslateY.setValue(18);
      coursesOpacity.setValue(0);
      coursesTranslateY.setValue(18);

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
        makeAnim(categoriesOpacity, categoriesTranslateY),
        makeAnim(coursesOpacity, coursesTranslateY),
      ]).start();
    }
  }, [
    loading,
    headerOpacity,
    headerTranslateY,
    categoriesOpacity,
    categoriesTranslateY,
    coursesOpacity,
    coursesTranslateY,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const handleOpenCourse = (course: Course) => {
    const el = imageRefs.current[course.id];
    if (el && onSelectCourse) {
      el.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          if (width > 0 && height > 0) {
            onSelectCourse(course, { x, y, width, height });
          } else {
            onSelectCourse(course);
          }
        },
      );
    } else if (onSelectCourse) {
      onSelectCourse(course);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesCategory =
        selectedCategory === 'Todos' || course.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, courses]);

  if (loading && !refreshing) {
    return <CatalogSkeleton />;
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
      keyboardShouldPersistTaps="handled"
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
        <View style={styles.titleRow}>
          <View>
            <View style={styles.badgeLabel}>
              <Compass size={13} color={colors.primary} />
              <Text style={styles.badgeLabelText}>Catálogo DevOps</Text>
            </View>
            <Text style={styles.title}>Explora los Cursos</Text>
            <Text style={styles.subtitle}>
              Domina las tecnologías más demandadas del ecosistema cloud
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por Docker, Kubernetes, CI/CD..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </RNAnimated.View>

      {/* Categories Pills */}
      <RNAnimated.View
        style={[
          styles.categoriesSection,
          {
            opacity: categoriesOpacity,
            transform: [{ translateY: categoriesTranslateY }],
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </RNAnimated.View>

      {/* Course List */}
      <RNAnimated.View
        style={[
          styles.coursesSection,
          {
            opacity: coursesOpacity,
            transform: [{ translateY: coursesTranslateY }],
          },
        ]}
      >
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'Todos'
              ? 'Todos los cursos'
              : `Cursos de ${selectedCategory}`}
          </Text>
          <Text style={styles.coursesCountText}>
            {filteredCourses.length}{' '}
            {filteredCourses.length === 1 ? 'curso' : 'cursos'}
          </Text>
        </View>

        {filteredCourses.length === 0 ? (
          <View style={styles.emptyState}>
            <Compass size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No encontramos cursos</Text>
            <Text style={styles.emptyText}>
              Prueba con otra palabra clave o selecciona otra categoría.
            </Text>
          </View>
        ) : (
          filteredCourses.map(course => {
            const isEnrolled = !!enrolledCourses[course.id];
            const isCompleted = !!completedCourses[course.id];
            
            let instructorName = 'Sin instructor';
            if (course.instructor) {
              if (typeof course.instructor === 'object') {
                instructorName = `${course.instructor.name} ${course.instructor.lastname}`;
              } else {
                instructorName = course.instructor;
              }
            }

            return (
              <View key={course.id} style={styles.courseCard}>
                <View
                  ref={(el: any) => {
                    imageRefs.current[course.id] = el;
                  }}
                  collapsable={false}
                  style={styles.courseImageWrapper}
                >
                  <TouchableOpacity
                    style={styles.courseImageTouch}
                    activeOpacity={0.9}
                    onPress={() => handleOpenCourse(course)}
                  >
                    <Image
                      source={
                        course.imageUrl
                          ? { uri: course.imageUrl }
                          : require('../../../assets/courses/devops_banner.jpg')
                      }
                      style={styles.courseImage}
                      resizeMode="cover"
                    />

                    <View style={styles.imageOverlayTags}>
                      <View style={styles.categoryTag}>
                        <Text style={styles.categoryTagText}>
                          {course.category}
                        </Text>
                      </View>
                      <View style={styles.tagsRightGroup}>
                        {isCompleted && (
                          <View style={styles.completedTag}>
                            <CheckCircle2
                              size={11}
                              color="#FFFFFF"
                              strokeWidth={2.6}
                            />
                            <Text style={styles.completedTagText}>Terminado</Text>
                          </View>
                        )}
                        <View style={styles.levelTag}>
                          <Text style={styles.levelTagText}>{course.level}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.courseCardContent}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>
                    {course.description}
                  </Text>

                  <View style={styles.courseMetaRow}>
                    <View style={styles.metaItem}>
                      <Clock size={13} color={colors.textMuted} />
                      <Text style={styles.metaText}>{course.duration}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <BookOpen size={13} color={colors.textMuted} />
                      <Text style={styles.metaText}>
                        {course.lessonsCount} lecciones
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.metaTextBold}>{course.rating}</Text>
                    </View>
                  </View>

                  <View style={styles.courseFooter}>
                    <View style={styles.instructorBlock}>
                      <Text style={styles.instructorLabel}>Instructor</Text>
                      <Text style={styles.instructorName}>
                        {instructorName}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.enrollButton,
                        isEnrolled && styles.enrolledButton,
                        isCompleted && styles.completedButton,
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        handleOpenCourse(course);
                      }}
                    >
                      {isEnrolled ? (
                        <>
                          <CheckCircle2
                            size={14}
                            color={isCompleted ? '#10B981' : colors.accent}
                            strokeWidth={2.5}
                          />
                          <Text
                            style={[
                              styles.enrolledButtonText,
                              isCompleted && styles.completedButtonText,
                            ]}
                          >
                            {isCompleted ? 'Curso terminado' : 'Continuar curso'}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.enrollButtonText}>Inscribirme</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
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
      gap: spacing.lg,
    },
    header: {
      gap: spacing.md,
    },
    titleRow: {
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
      marginTop: 2,
      lineHeight: 18,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.sm + 4,
      fontSize: 14,
      color: colors.text,
    },
    categoriesSection: {
      marginHorizontal: -spacing.lg,
    },
    categoriesRow: {
      paddingHorizontal: spacing.lg,
      gap: spacing.xs + 2,
    },
    categoryPill: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: radius.full,
    },
    categoryPillSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    categoryTextSelected: {
      color: colors.textOnPrimary,
      fontWeight: '700',
    },
    coursesSection: {
      gap: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    coursesCountText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    courseCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    courseImageWrapper: {
      width: '100%',
      height: 155,
      backgroundColor: colors.surfaceAlt,
      position: 'relative',
      overflow: 'hidden',
    },
    courseImageTouch: {
      width: '100%',
      height: '100%',
    },
    courseImage: {
      width: '100%',
      height: '100%',
    },
    imageOverlayTags: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      right: spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    courseCardContent: {
      padding: spacing.md,
      gap: spacing.sm,
    },
    categoryTag: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    categoryTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text,
    },
    levelTag: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    levelTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textOnPrimary,
    },
    completedTag: {
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.sm,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },
    completedTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    tagsRightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    courseTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 20,
    },
    courseDescription: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    courseMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 2,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    metaTextBold: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    courseFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.xs + 2,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    instructorBlock: {
      gap: 1,
    },
    instructorLabel: {
      fontSize: 10,
      color: colors.textMuted,
      textTransform: 'uppercase',
    },
    instructorName: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    enrollButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    enrollButtonText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    enrolledButton: {
      backgroundColor: `${colors.accent}16`,
      borderWidth: 1,
      borderColor: `${colors.accent}40`,
      flexDirection: 'row',
      gap: 4,
    },
    enrolledButtonText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
    },
    completedButton: {
      backgroundColor: '#10B9811A',
      borderColor: '#10B98150',
    },
    completedButtonText: {
      color: '#10B981',
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
