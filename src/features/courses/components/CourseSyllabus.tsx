import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Award,
  CheckCircle2,
  Clock,
  FileQuestion,
  Pause,
  Play,
  Star,
  Users,
  Paperclip,
  MessageSquare,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { ThemeColors } from '../../../shared/theme';
import type { CommentItem, Course, CourseModule, VideoLesson } from '../types';

type Props = Readonly<{
  course: Course;
  modules: CourseModule[];
  allLessons: VideoLesson[];
  activeLessonIndex: number;
  isPlaying: boolean;
  completedLessonIds: Record<string, boolean>;
  lessonCommentsMap: Record<string, CommentItem[]>;
  lessonQuizMap: Record<
    string,
    { selected: number | null; submitted: boolean; isCorrect: boolean }
  >;
  onSelectLesson: (index: number) => void;
  canTakeExam?: boolean;
  hasPassedExam?: boolean;
  onTakeExam?: () => void;
  onViewCertificate?: () => void;
}>;

export default function CourseSyllabus({
  course,
  modules,
  allLessons,
  activeLessonIndex,
  isPlaying,
  completedLessonIds,
  lessonCommentsMap,
  lessonQuizMap,
  onSelectLesson,
  canTakeExam,
  hasPassedExam,
  onTakeExam,
  onViewCertificate,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Track expanded modules. Open the first module by default.
  const [expandedModules, setExpandedModules] = React.useState<
    Record<string, boolean>
  >(() => {
    if (modules && modules.length > 0) {
      return { [modules[0].id]: true };
    }
    return {};
  });

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  return (
    <View>
      {/* Metrics bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <View style={styles.starRow}>
            <Star size={15} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.metricBold}>{course.rating}</Text>
          </View>
          <Text style={styles.metricLabel}>Valoración</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <View style={styles.starRow}>
            <Clock size={15} color={colors.primary} />
            <Text style={styles.metricBold}>{course.duration}</Text>
          </View>
          <Text style={styles.metricLabel}>Duración</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <View style={styles.starRow}>
            <Users size={15} color={colors.accent} />
            <Text style={styles.metricBold}>
              {course.studentsCount?.toLocaleString() ?? 0}
            </Text>
          </View>
          <Text style={styles.metricLabel}>Alumnos</Text>
        </View>
      </View>

      {/* Modules List */}
      <View style={styles.section}>
        <View style={styles.syllabusTitleRow}>
          <Text style={styles.sectionTitle}>Módulos y Lecciones en Video</Text>
          <View style={styles.syllabusBadgesRow}>
            <Text style={styles.syllabusTotalBadge}>
              {allLessons.length} Clases
            </Text>
          </View>
        </View>

        {modules.map(mod => {
          const isExpanded = !!expandedModules[mod.id];
          return (
            <View key={mod.id} style={styles.moduleCard}>
              <TouchableOpacity
                style={[
                  styles.moduleHeaderRow,
                  isExpanded ? styles.moduleHeaderRowExpanded : null,
                ]}
                onPress={() => toggleModule(mod.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.moduleHeader}>{mod.title}</Text>
                <Text style={styles.moduleCount}>
                  {mod.lessons.length} videos
                </Text>
              </TouchableOpacity>

              {isExpanded &&
                mod.lessons.map(lesson => {
                  const globalIdx = allLessons.findIndex(
                    l => l.id === lesson.id,
                  );
                  const isCurrent = globalIdx === activeLessonIndex;
                  const isDone = completedLessonIds[lesson.id];
                  const commentCount = (lessonCommentsMap[lesson.id] || [])
                    .length;
                  const quizState = lessonQuizMap[lesson.id];

                  let lessonIcon = (
                    <Play
                      size={13}
                      color={colors.textMuted}
                      style={styles.lessonIconPlay}
                    />
                  );
                  if (isCurrent && isPlaying) {
                    lessonIcon = (
                      <Pause size={15} color="#FFFFFF" fill="#FFFFFF" />
                    );
                  } else if (isCurrent) {
                    lessonIcon = (
                      <Play
                        size={15}
                        color="#FFFFFF"
                        fill="#FFFFFF"
                        style={styles.lessonIconPlay}
                      />
                    );
                  } else if (isDone) {
                    lessonIcon = (
                      <CheckCircle2
                        size={16}
                        color={colors.accent}
                        strokeWidth={2.5}
                      />
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={lesson.id}
                      style={[
                        styles.lessonItemRow,
                        isCurrent && styles.lessonItemRowActive,
                      ]}
                      onPress={() => onSelectLesson(globalIdx)}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.lessonIconBox,
                          isCurrent && styles.lessonIconBoxActive,
                          isDone && !isCurrent && styles.lessonIconBoxDone,
                        ]}
                      >
                        {lessonIcon}
                      </View>

                      <View style={styles.lessonInfoCol}>
                        <Text
                          style={[
                            styles.lessonItemTitle,
                            isCurrent && styles.lessonItemTitleActive,
                          ]}
                          numberOfLines={2}
                        >
                          {lesson.title}
                        </Text>

                        <View style={styles.lessonMetaBar}>
                          <View style={styles.lessonMetaGroup}>
                            <Clock size={11} color={colors.textMuted} />
                            <Text style={styles.lessonDuration}>
                              {lesson.duration} min
                            </Text>
                          </View>

                          <View style={styles.badgeView}>
                            <Paperclip size={10} color={colors.textMuted} />
                            <Text style={styles.badgeViewText}>
                              {lesson.resources.length}
                            </Text>
                          </View>

                          <View style={styles.badgeView}>
                            <MessageSquare size={10} color={colors.textMuted} />
                            <Text style={styles.badgeViewText}>
                              {commentCount}
                            </Text>
                          </View>

                          {quizState?.submitted && (
                            <Text
                              style={[
                                styles.lessonPerItemBadge,
                                quizState.isCorrect
                                  ? styles.quizBadgeGreen
                                  : styles.quizBadgeRed,
                              ]}
                            >
                              {quizState.isCorrect ? 'Quiz ✓' : 'Quiz ✗'}
                            </Text>
                          )}

                          {isCurrent && (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>
                                {isPlaying ? 'En video' : 'Seleccionada'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          );
        })}

        {/* Final Exam Banner */}
        {canTakeExam && (
          <View
            style={[
              styles.examBannerCard,
              hasPassedExam && styles.examBannerCardPassed,
            ]}
          >
            <View style={styles.examBannerTop}>
              <View
                style={[
                  styles.examBadgeIcon,
                  hasPassedExam && styles.examBadgeIconPassed,
                ]}
              >
                <Award
                  size={26}
                  color={hasPassedExam ? '#10B981' : colors.primary}
                />
              </View>
              <View style={styles.examBannerTextWrap}>
                <Text style={styles.examBannerTitle}>
                  {hasPassedExam
                    ? '¡Examen Final Aprobado!'
                    : 'Examen Final de Certificación'}
                </Text>
                <Text style={styles.examBannerDesc}>
                  {hasPassedExam
                    ? 'Has superado el examen y obtenido tu certificación oficial.'
                    : '¡Completaste todas las lecciones! Rinde el examen para certificar tus conocimientos.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.examActionBtn,
                hasPassedExam && styles.examActionBtnPassed,
              ]}
              onPress={hasPassedExam ? onViewCertificate : onTakeExam}
              activeOpacity={0.8}
            >
              <Award size={18} color="#FFFFFF" />
              <Text style={styles.examActionBtnText}>
                {hasPassedExam
                  ? 'Ver Certificado Oficial'
                  : 'Rendir Examen Final'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de este curso</Text>
        <Text style={styles.description}>{course.description}</Text>

        {/* Features Highlights List */}
        <View style={styles.featuresList}>
          {(Array.isArray(course.features) && course.features.length > 0
            ? course.features
            : [
                'Acceso ilimitado a todas las lecciones y recursos',
                'Laboratorios prácticos y despliegues en vivo',
                'Evaluaciones interactivas por cada módulo',
                'Certificado oficial de finalización verificado',
              ]
          ).map((feature, idx) => (
            <View key={`${feature}-${idx}`} style={styles.featureRow}>
              <CheckCircle2 size={18} color={colors.accent} strokeWidth={2.2} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    metricsBar: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'space-around',
      marginBottom: 20,
    },
    metricItem: {
      alignItems: 'center',
      flex: 1,
    },
    starRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    metricBold: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
    },
    metricLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    metricDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.border,
    },
    section: {
      marginBottom: 20,
    },
    syllabusTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.2,
    },
    syllabusTotalBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    syllabusBadgesRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    completedTag: {
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.25,
      shadowRadius: 2,
    },
    completedTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    moduleCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },
    moduleHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    moduleHeaderRowExpanded: {
      marginBottom: 10,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    moduleHeader: {
      flex: 1,
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginRight: 8,
    },
    moduleCount: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    lessonItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lessonItemRowActive: {
      backgroundColor: `${colors.primary}0D`,
      marginHorizontal: -8,
      paddingHorizontal: 8,
      borderRadius: 10,
    },
    lessonIconBox: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    lessonIconBoxActive: {
      backgroundColor: colors.primary,
    },
    lessonIconBoxDone: {
      backgroundColor: `${colors.accent}20`,
    },
    lessonIconPlay: {
      marginLeft: 2,
    },
    lessonInfoCol: {
      flex: 1,
    },
    lessonItemTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    lessonItemTitleActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    lessonMetaBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
    },
    lessonMetaGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    lessonDuration: {
      fontSize: 11,
      color: colors.textMuted,
    },
    lessonPerItemBadge: {
      fontSize: 10,
      color: colors.textMuted,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
      fontWeight: '600',
    },
    badgeView: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 4,
    },
    badgeViewText: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '600',
    },
    quizBadgeGreen: {
      color: '#10B981',
      backgroundColor: '#10B98118',
    },
    quizBadgeRed: {
      color: '#EF4444',
      backgroundColor: '#EF444418',
    },
    activePill: {
      backgroundColor: colors.primary,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 4,
    },
    activePillText: {
      fontSize: 9,
      color: '#FFFFFF',
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    description: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 20,
      marginTop: 6,
    },
    featuresList: {
      marginTop: 14,
      gap: 12,
    },
    featuresCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      marginBottom: 20,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    featureText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
    },
    examBannerCard: {
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      marginTop: 14,
      gap: 14,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    examBannerCardPassed: {
      borderColor: '#10B981',
      backgroundColor: '#10B98108',
    },
    examBannerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    examBadgeIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    examBadgeIconPassed: {
      backgroundColor: '#10B98120',
    },
    examBannerTextWrap: {
      flex: 1,
    },
    examBannerTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 3,
    },
    examBannerDesc: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 17,
    },
    examActionBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8,
    },
    examActionBtnPassed: {
      backgroundColor: '#10B981',
    },
    examActionBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });
