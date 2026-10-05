import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import coursesApi, {
  FinalExamData,
  ExamSubmitResponse,
} from '../services/coursesApi';

interface FinalExamModalProps {
  visible: boolean;
  courseId: string;
  courseTitle: string;
  onClose: () => void;
  onExamPassed: (result: ExamSubmitResponse) => void;
}

export default function FinalExamModal({
  visible,
  courseId,
  courseTitle,
  onClose,
  onExamPassed,
}: FinalExamModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState<FinalExamData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [result, setResult] = useState<ExamSubmitResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible && courseId) {
      loadExam();
    }
  }, [visible, courseId]);

  const loadExam = async () => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const data = await coursesApi.getFinalExam(courseId);
      if (!data || !data.questions || data.questions.length === 0) {
        setErrorMsg('Este curso aún no tiene un examen final configurado.');
      } else {
        setExam(data);
      }
    } catch {
      setErrorMsg('No se pudo cargar el examen. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (!exam) return;

    // Check all questions answered
    const unanswered = exam.questions.some(q => !selectedAnswers[q.id]);
    if (unanswered) {
      setErrorMsg('Por favor responde todas las preguntas antes de enviar.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    const answersPayload = Object.entries(selectedAnswers).map(
      ([questionId, selectedOptionId]) => ({
        questionId,
        selectedOptionId,
      }),
    );

    try {
      const res = await coursesApi.submitFinalExam(courseId, answersPayload);
      setResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar el examen');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinuePassed = () => {
    if (result) {
      onExamPassed(result);
    }
  };

  const currentQuestion = exam?.questions[currentQuestionIndex];
  const totalQuestions = exam?.questions.length ?? 0;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeIcon}>
                <FileQuestion size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Examen Final</Text>
                <Text style={styles.headerSubtitle} numberOfLines={1}>
                  {courseTitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={submitting}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando preguntas...</Text>
            </View>
          ) : result ? (
            /* Results View */
            <View style={styles.resultContainer}>
              {result.passed ? (
                <>
                  <View style={styles.successIconWrapper}>
                    <Award size={64} color="#10B981" />
                  </View>
                  <Text style={styles.resultTitle}>¡Felicidades, aprobaste!</Text>
                  <Text style={styles.resultDescription}>
                    Has superado exitosamente el examen final con una calificación de:
                  </Text>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillText}>
                      {result.score} / 20 puntos
                    </Text>
                  </View>
                  <Text style={styles.passNote}>
                    Aprobado con {result.score >= 15 ? 'calificación sobresaliente' : 'éxito'}.
                  </Text>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    onPress={handleContinuePassed}>
                    <Text style={styles.actionBtnText}>
                      Continuar a Valorar Curso
                    </Text>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.failIconWrapper}>
                    <XCircle size={64} color="#EF4444" />
                  </View>
                  <Text style={styles.resultTitle}>No alcanzaste el puntaje</Text>
                  <Text style={styles.resultDescription}>
                    Tu puntaje obtenido fue de:
                  </Text>
                  <View style={[styles.scorePill, styles.scorePillFail]}>
                    <Text style={[styles.scorePillText, styles.scorePillTextFail]}>
                      {result.score} / 20 puntos
                    </Text>
                  </View>
                  <Text style={styles.failNote}>
                    Se requiere un mínimo de 15/20 para aprobar y obtener tu certificado.
                  </Text>
                  <View style={styles.failActionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={loadExam}>
                      <RotateCcw size={16} color={colors.text} />
                      <Text style={styles.actionBtnSecondaryText}>
                        Reintentar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionBtnPrimary, { flex: 1 }]}
                      onPress={onClose}>
                      <Text style={styles.actionBtnText}>Revisar Lecciones</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ) : errorMsg && !exam ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{errorMsg}</Text>
              <TouchableOpacity
                style={[styles.actionBtnPrimary, { marginTop: spacing.md }]}
                onPress={onClose}>
                <Text style={styles.actionBtnText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          ) : exam && currentQuestion ? (
            /* Questions View */
            <View style={styles.examBody}>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>
                    Pregunta {currentQuestionIndex + 1} de {totalQuestions}
                  </Text>
                  <Text style={styles.answeredCount}>
                    {answeredCount}/{totalQuestions} respondidas
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {errorMsg ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{errorMsg}</Text>
                </View>
              ) : null}

              <ScrollView
                style={styles.questionScroll}
                contentContainerStyle={styles.questionContent}
                showsVerticalScrollIndicator={false}>
                <Text style={styles.questionText}>{currentQuestion.text}</Text>

                <View style={styles.optionsList}>
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected =
                      selectedAnswers[currentQuestion.id] === opt.id;
                    return (
                      <TouchableOpacity
                        key={opt.id}
                        activeOpacity={0.7}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        onPress={() =>
                          handleSelectOption(currentQuestion.id, opt.id)
                        }>
                        <View
                          style={[
                            styles.optionRadio,
                            isSelected && styles.optionRadioSelected,
                          ]}>
                          {isSelected ? (
                            <Check size={14} color="#FFFFFF" strokeWidth={3} />
                          ) : (
                            <Text style={styles.optionLetter}>
                              {String.fromCharCode(65 + idx)}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                          ]}>
                          {opt.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Navigation Footer */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    currentQuestionIndex === 0 && styles.navBtnDisabled,
                  ]}
                  disabled={currentQuestionIndex === 0}
                  onPress={() =>
                    setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
                  }>
                  <ChevronLeft
                    size={20}
                    color={
                      currentQuestionIndex === 0
                        ? colors.textMuted
                        : colors.text
                    }
                  />
                  <Text
                    style={[
                      styles.navBtnText,
                      currentQuestionIndex === 0 && styles.navBtnTextDisabled,
                    ]}>
                    Anterior
                  </Text>
                </TouchableOpacity>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <TouchableOpacity
                    style={styles.navBtnPrimary}
                    onPress={() =>
                      setCurrentQuestionIndex(prev =>
                        Math.min(totalQuestions - 1, prev + 1),
                      )
                    }>
                    <Text style={styles.navBtnPrimaryText}>Siguiente</Text>
                    <ChevronRight size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[
                      styles.navBtnSubmit,
                      submitting && styles.navBtnDisabled,
                    ]}
                    disabled={submitting}
                    onPress={handleSubmit}>
                    {submitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Award size={18} color="#FFFFFF" />
                        <Text style={styles.navBtnPrimaryText}>
                          Enviar Examen
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.md,
    },
    modalCard: {
      backgroundColor: colors.surface,
      width: '100%',
      maxHeight: '90%',
      borderRadius: radius.xl,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    badgeIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.primary + '1A',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      maxWidth: 200,
    },
    closeBtn: {
      padding: spacing.xs,
    },
    centerContainer: {
      padding: spacing.xxl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: 14,
      color: colors.textMuted,
    },
    errorText: {
      fontSize: 15,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 22,
    },
    errorBanner: {
      backgroundColor: '#EF44441A',
      padding: spacing.sm,
      borderRadius: radius.md,
      marginHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    errorBannerText: {
      color: '#EF4444',
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '500',
    },
    examBody: {
      flexShrink: 1,
    },
    progressContainer: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    progressLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
    },
    answeredCount: {
      fontSize: 12,
      color: colors.textMuted,
    },
    progressTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: radius.full,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: radius.full,
    },
    questionScroll: {
      maxHeight: 380,
    },
    questionContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    questionText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 24,
      marginBottom: spacing.lg,
    },
    optionsList: {
      gap: spacing.sm,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
      gap: spacing.md,
    },
    optionCardSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    optionRadio: {
      width: 28,
      height: 28,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    optionRadioSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    optionLetter: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textMuted,
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    optionTextSelected: {
      fontWeight: '600',
      color: colors.text,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.md,
    },
    navBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      gap: 4,
    },
    navBtnDisabled: {
      opacity: 0.4,
    },
    navBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    navBtnTextDisabled: {
      color: colors.textMuted,
    },
    navBtnPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      gap: 6,
    },
    navBtnSubmit: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      gap: 6,
    },
    navBtnPrimaryText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    resultContainer: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    successIconWrapper: {
      width: 96,
      height: 96,
      borderRadius: radius.full,
      backgroundColor: '#10B9811A',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    failIconWrapper: {
      width: 96,
      height: 96,
      borderRadius: radius.full,
      backgroundColor: '#EF44441A',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    resultTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    resultDescription: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    scorePill: {
      backgroundColor: '#10B98122',
      borderWidth: 1.5,
      borderColor: '#10B981',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      marginBottom: spacing.sm,
    },
    scorePillFail: {
      backgroundColor: '#EF444422',
      borderColor: '#EF4444',
    },
    scorePillText: {
      fontSize: 20,
      fontWeight: '800',
      color: '#10B981',
    },
    scorePillTextFail: {
      color: '#EF4444',
    },
    passNote: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: spacing.xl,
    },
    failNote: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 18,
    },
    actionBtnPrimary: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: radius.full,
      gap: spacing.sm,
      width: '100%',
    },
    actionBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
    failActionsRow: {
      flexDirection: 'row',
      gap: spacing.md,
      width: '100%',
    },
    actionBtnSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 6,
    },
    actionBtnSecondaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
  });
