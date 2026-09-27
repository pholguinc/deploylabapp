import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Check,
  CheckCircle2,
  HelpCircle,
  SkipForward,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { ThemeColors } from '../../../shared/theme';
import type { VideoLesson } from '../types';

export type QuizState = {
  selected: number | null;
  submitted: boolean;
  isCorrect: boolean;
};

type Props = Readonly<{
  activeLesson: VideoLesson;
  activeLessonIndex: number;
  totalLessons: number;
  quizState: QuizState;
  onSelectOption: (optionIndex: number) => void;
  onCheckQuiz: () => void;
  onResetQuiz: () => void;
  onNextLesson?: () => void;
}>;

export default function CourseQuiz({
  activeLesson,
  activeLessonIndex,
  totalLessons,
  quizState,
  onSelectOption,
  onCheckQuiz,
  onResetQuiz,
  onNextLesson,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.tabContentSection}>
      <View style={styles.interactiveQuizCard}>
        <View style={styles.interactiveQuizHeader}>
          <View style={styles.quizBadgeRow}>
            <HelpCircle size={16} color={colors.primary} />
            <Text style={styles.interactiveQuizBadge}>
              EVALUACIÓN DE LA LECCIÓN {activeLessonIndex + 1}
            </Text>
          </View>
          <Text style={styles.quizQuestionNum}>Puntaje: {activeLesson.quiz.passingScore}</Text>
        </View>

        <Text style={styles.quizLessonContextTitle}>{activeLesson.title}</Text>
        <Text style={styles.quizQuestionText}>{activeLesson.quiz.question}</Text>

        <View style={styles.quizOptionsList}>
          {activeLesson.quiz.options.map((opt, idx) => {
            const isSelected = quizState.selected === idx;
            let optionStyle = styles.quizOption;
            if (isSelected) optionStyle = { ...optionStyle, ...styles.quizOptionSelected };
            if (quizState.submitted) {
              if (idx === activeLesson.quiz.correctIndex) {
                optionStyle = { ...optionStyle, ...styles.quizOptionCorrect };
              } else if (isSelected && !quizState.isCorrect) {
                optionStyle = { ...optionStyle, ...styles.quizOptionWrong };
              }
            }

            return (
              <TouchableOpacity
                key={opt}
                style={optionStyle}
                onPress={() => onSelectOption(idx)}
                activeOpacity={0.8}
                disabled={quizState.submitted}>
                <View
                  style={[
                    styles.optionRadio,
                    isSelected && styles.optionRadioSelected,
                    quizState.submitted &&
                      idx === activeLesson.quiz.correctIndex &&
                      styles.optionRadioCorrect,
                  ]}>
                  {quizState.submitted && idx === activeLesson.quiz.correctIndex ? (
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  ) : (
                    <Text
                      style={[
                        styles.optionLetter,
                        isSelected && styles.optionLetterSelected,
                      ]}>
                      {String.fromCharCode(65 + idx)}
                    </Text>
                  )}
                </View>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {quizState.submitted ? (
          <View style={styles.quizFeedbackBox}>
            {quizState.isCorrect ? (
              <View style={styles.correctFeedback}>
                <CheckCircle2 size={18} color="#10B981" />
                <Text style={styles.correctFeedbackText}>
                  {activeLesson.quiz.explanation}
                </Text>
              </View>
            ) : (
              <View style={styles.wrongFeedback}>
                <XCircle size={18} color="#EF4444" />
                <Text style={styles.wrongFeedbackText}>
                  Respuesta incorrecta. Revisa el contenido del video y vuelve a intentarlo.
                </Text>
              </View>
            )}

            <View style={styles.quizActionButtonsRow}>
              <TouchableOpacity
                style={styles.retryQuizBtn}
                onPress={onResetQuiz}
                activeOpacity={0.8}>
                <Text style={styles.retryQuizBtnText}>Reintentar quiz</Text>
              </TouchableOpacity>

              {quizState.isCorrect && activeLessonIndex < totalLessons - 1 && onNextLesson && (
                <TouchableOpacity
                  style={styles.nextLessonQuizBtn}
                  onPress={onNextLesson}
                  activeOpacity={0.8}>
                  <Text style={styles.nextLessonQuizBtnText}>Ir a siguiente lección</Text>
                  <SkipForward size={14} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.checkQuizBtn}
            onPress={onCheckQuiz}
            activeOpacity={0.8}>
            <Text style={styles.checkQuizBtnText}>Comprobar respuesta de la lección</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabContentSection: {
      gap: 16,
    },
    interactiveQuizCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
    },
    interactiveQuizHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    quizBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    interactiveQuizBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    quizQuestionNum: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    quizLessonContextTitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
    },
    quizQuestionText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 21,
      marginBottom: 16,
    },
    quizOptionsList: {
      gap: 8,
      marginBottom: 16,
    },
    quizOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      gap: 10,
    },
    quizOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}0D`,
    },
    quizOptionCorrect: {
      borderColor: '#10B981',
      backgroundColor: '#10B98115',
    },
    quizOptionWrong: {
      borderColor: '#EF4444',
      backgroundColor: '#EF444415',
    },
    optionRadio: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    optionRadioSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    optionRadioCorrect: {
      borderColor: '#10B981',
      backgroundColor: '#10B981',
    },
    optionLetter: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    optionLetterSelected: {
      color: '#FFFFFF',
    },
    optionText: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    checkQuizBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkQuizBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    quizFeedbackBox: {
      marginTop: 4,
      gap: 12,
    },
    correctFeedback: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: '#10B98115',
      borderWidth: 1,
      borderColor: '#10B98140',
      padding: 12,
      borderRadius: 12,
    },
    correctFeedbackText: {
      flex: 1,
      fontSize: 12,
      color: '#059669',
      lineHeight: 17,
      fontWeight: '600',
    },
    wrongFeedback: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: '#EF444415',
      borderWidth: 1,
      borderColor: '#EF444440',
      padding: 12,
      borderRadius: 12,
    },
    wrongFeedbackText: {
      flex: 1,
      fontSize: 12,
      color: '#DC2626',
      lineHeight: 17,
      fontWeight: '600',
    },
    quizActionButtonsRow: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    retryQuizBtn: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryQuizBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    nextLessonQuizBtn: {
      flex: 1.5,
      flexDirection: 'row',
      gap: 6,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextLessonQuizBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
