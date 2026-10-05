import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileQuestion,
  FileText,
  MessageSquare,
  Pause,
  Play,
  Share2,
  SkipForward,
  ShieldCheck,
} from 'lucide-react-native';

import ImageGradientOverlay from '../../../shared/components/ImageGradientOverlay';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import CourseDetailSkeleton from '../components/CourseDetailSkeleton';
import CourseComments from '../components/CourseComments';
import CourseQuiz, { type QuizState } from '../components/CourseQuiz';
import CourseResources from '../components/CourseResources';
import CourseShareModal from '../components/CourseShareModal';
import CourseReviewModal from '../components/CourseReviewModal';
import FinalExamModal from '../components/FinalExamModal';
import CertificateModal from '../components/CertificateModal';
import CourseSyllabus from '../components/CourseSyllabus';
import CourseVideoPlayer from '../components/CourseVideoPlayer';
import type {
  CommentItem,
  DetailTabKey,
  CourseModule,
  CourseResource,
} from '../types';
import type { CourseDetailProps } from '../../../shared/types/navigation';
import coursesApi, {
  type CertificateData,
  type ExamSubmitResponse,
} from '../services/coursesApi';
import { useAuthStore } from '../../auth/store/useAuthStore';

const HERO_HEIGHT = 260;

export default function CourseDetailScreen({
  navigation,
  route,
}: CourseDetailProps) {
  const { width, height } = Dimensions.get('window');
  const SCREEN_WIDTH = Math.min(width, height);
  const SCREEN_HEIGHT = Math.max(width, height);
  const { course, cardLayout, autoPlay, initialLessonId } = route.params;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [courseData, setCourseData] = useState<Course>(course);
  const [isEnrolled, setIsEnrolled] = useState(
    route.params.isEnrolled ?? false,
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<DetailTabKey>('syllabus');

  const scrollRef = useRef<any>(null);
  const isExitingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [studentsCount, setStudentsCount] = useState(course.studentsCount || 0);

  // Modules setup
  const [modules, setModules] = useState<CourseModule[]>([
    {
      id: 'loading-module',
      title: 'Cargando...',
      lessons: [
        {
          id: 'loading-lesson',
          title: 'Cargando lección...',
          duration: '0:00',
          durationSec: 0,
          videoQuality: '1080p',
          isCompleted: false,
          resources: [],
          initialComments: [],
          quiz: {
            id: 'loading-quiz',
            question: 'Cargando...',
            options: ['Opción 1'],
            correctIndex: 0,
            explanation: '',
            passingScore: '100%',
          },
        },
      ],
    },
  ]);

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      try {
        const [detail, enrollment] = await Promise.all([
          coursesApi.getDetail(course.id),
          coursesApi
            .checkEnrollmentStatus(course.id)
            .catch(() => ({ isEnrolled: false, progress: null })),
        ]);
        if (!mounted) return;

        if (detail) {
          const { modules: _detailModules, ...detailFields } = detail;
          setCourseData(prev => ({
            ...prev,
            ...detailFields,
            features:
              detail.features && detail.features.length > 0
                ? detail.features
                : prev.features,
          }));
        }

        if (enrollment.isEnrolled) {
          setIsEnrolled(true);
        }

        if (
          enrollment.progress?.status === 'COMPLETED' ||
          (typeof enrollment.progress?.progress === 'number' &&
            enrollment.progress.progress >= 100)
        ) {
          setHasPassedExam(true);
        }

        if (enrollment.progress && enrollment.progress.completedLessons) {
          const completedMap: Record<string, boolean> = {};
          enrollment.progress.completedLessons.forEach((id: string) => {
            completedMap[id] = true;
          });
          setCompletedLessonIds(completedMap);
        }

        // Check Certificate / Exam Attempt
        try {
          const cert = await coursesApi.getCertificate(course.id);
          if (cert && mounted) {
            setCertificate(cert);
            setHasPassedExam(true);
          } else {
            const attempt = await coursesApi.getLastExamAttempt(course.id);
            if (attempt?.passed && mounted) {
              setHasPassedExam(true);
            }
          }
        } catch {
          // ignore
        }

        if (detail.modules && detail.modules.length > 0) {
          const mappedModules: CourseModule[] = detail.modules.map(m => ({
            id: m.id,
            title: m.title,
            lessons: (m.lessons || []).map(l => ({
              id: l.id,
              title: l.title,
              duration: String(l.duration || '0').replace(/[^0-9]/g, ''),
              durationSec:
                (String(l.duration || '')
                  .toLowerCase()
                  .includes('h')
                  ? parseInt(l.duration) * 3600
                  : parseInt(l.duration) * 60) || 600,
              videoQuality: '1080p',
              videoUrl: l.videoUrl ?? null,
              isCompleted: false,
              resources: (l.resources || []).map(r => ({
                id: r.id,
                title: r.name || 'Recurso',
                type: (r.type || 'pdf').toLowerCase() as CourseResource['type'],
                size: r.size || '1MB',
                description: '',
              })),
              initialComments: [],
              quiz: l.quizzes?.[0]
                ? {
                    id: l.quizzes[0].id,
                    question: l.quizzes[0].questions?.[0]?.text || 'Pregunta',
                    options: (l.quizzes[0].questions?.[0]?.options || []).map(
                      o => o.text,
                    ),
                    correctIndex: Math.max(
                      0,
                      (l.quizzes[0].questions?.[0]?.options || []).findIndex(
                        o => o.isCorrect,
                      ),
                    ),
                    explanation: 'Explicación del examen',
                    passingScore: '70%',
                  }
                : {
                    id: 'q_' + l.id,
                    question: '¿Qué aprendiste en esta lección?',
                    options: ['Opción 1'],
                    correctIndex: 0,
                    explanation: '',
                    passingScore: '100%',
                  },
            })),
          }));
          setModules(mappedModules);
        }
      } catch (error) {
        console.warn('Failed to load real course detail', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadDetail();
    return () => {
      mounted = false;
    };
  }, [course.id]);

  const allLessons = useMemo(() => modules.flatMap(m => m.lessons), [modules]);

  // Initial lesson selection
  const resolvedInitialIdx = useMemo(() => {
    if (!initialLessonId) return -1;
    const found = allLessons.findIndex(l => l.id === initialLessonId);
    return found >= 0 ? found : -1;
  }, [allLessons, initialLessonId]);

  const [activeLessonIndex, setActiveLessonIndex] =
    useState(resolvedInitialIdx);
  const activeLesson =
    activeLessonIndex >= 0 ? allLessons[activeLessonIndex] : undefined;

  // Video Playback State
  const [isPlaying, setIsPlaying] = useState(Boolean(autoPlay));
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(
    activeLesson?.isCompleted ? activeLesson.durationSec : 45,
  );
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Per-Lesson Completed Status
  const [completedLessonIds, setCompletedLessonIds] = useState<
    Record<string, boolean>
  >(() => {
    const initialMap: Record<string, boolean> = {};
    for (const l of allLessons) {
      if (l.isCompleted) initialMap[l.id] = true;
    }
    return initialMap;
  });

  // Per-Lesson Comments State
  const [lessonCommentsMap, setLessonCommentsMap] = useState<
    Record<string, CommentItem[]>
  >(() => {
    const initialMap: Record<string, CommentItem[]> = {};
    for (const l of allLessons) {
      initialMap[l.id] = l.initialComments || [];
    }
    return initialMap;
  });

  // Per-Lesson Quiz State
  const [lessonQuizMap, setLessonQuizMap] = useState<Record<string, QuizState>>(
    {},
  );

  // Modals State
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isFinalExamVisible, setIsFinalExamVisible] = useState(false);
  const [isCertificateModalVisible, setIsCertificateModalVisible] =
    useState(false);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [hasPassedExam, setHasPassedExam] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Current lesson comments and quiz state
  const currentComments = activeLesson
    ? lessonCommentsMap[activeLesson.id] || []
    : [];
  const currentQuizState = activeLesson
    ? lessonQuizMap[activeLesson.id] || {
        selected: null,
        submitted: false,
        isCorrect: false,
      }
    : {
        selected: null,
        submitted: false,
        isCorrect: false,
      };

  // Shared Animation Values
  const startX = cardLayout?.x ?? 0;
  const startY = cardLayout?.y ?? 0;
  const startWidth = cardLayout?.width ?? SCREEN_WIDTH;
  const startHeight = cardLayout?.height ?? HERO_HEIGHT;

  const progress = useSharedValue(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(1, {
      damping: 22,
      stiffness: 140,
      mass: 0.8,
    });
  }, [progress]);

  // Video playback is now natively controlled.
  const handleTimeUpdate = useCallback(
    (time: number) => {
      setCurrentTimeSec(time);

      // Auto-complete lesson if we reach the end
      if (
        activeLesson &&
        time >= activeLesson.durationSec &&
        !completedLessonIds[activeLesson.id]
      ) {
        setCompletedLessonIds(old => ({ ...old, [activeLesson.id]: true }));
        setIsPlaying(false);
      }
    },
    [activeLesson, completedLessonIds],
  );

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  const handleRewind = () => {
    setCurrentTimeSec(prev => Math.max(0, prev - 10));
  };

  const handleForward = () => {
    setCurrentTimeSec(prev =>
      Math.min(activeLesson?.durationSec || 0, prev + 10),
    );
  };

  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastOpacity = useSharedValue(0);
  const toastTranslateY = useSharedValue(20);

  const showToast = (message: string) => {
    setToastMessage(message);
    toastOpacity.value = withSpring(1, { damping: 15 });
    toastTranslateY.value = withSpring(0, { damping: 12 });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      toastOpacity.value = withSpring(0);
      toastTranslateY.value = withSpring(20);
    }, 3000);
  };

  const handleEnroll = async () => {
    if (isEnrolling) return;
    try {
      setIsEnrolling(true);
      await coursesApi.enroll(course.id);
      setIsEnrolled(true);
      setIsPlaying(true);
      setStudentsCount(prev => prev + 1);
      showToast('¡Te has inscrito al curso con éxito!');
    } catch (err: any) {
      showToast(err.message || 'Ocurrió un error al inscribirte');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSelectLesson = (idx: number) => {
    if (!isEnrolled) {
      showToast('Debes inscribirte al curso para reproducir los videos.');
      return;
    }
    setActiveLessonIndex(idx);
    const newLesson = allLessons[idx];
    setCurrentTimeSec(newLesson.isCompleted ? newLesson.durationSec : 0);
    setIsPlaying(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextLesson = () => {
    if (activeLessonIndex < allLessons.length - 1) {
      handleSelectLesson(activeLessonIndex + 1);
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!activeLesson) return;

    const isCurrentlyCompleted = !!completedLessonIds[activeLesson.id];
    const newStatus = !isCurrentlyCompleted;

    // Optimistic update
    setCompletedLessonIds(old => {
      const copy = { ...old };
      if (newStatus) {
        copy[activeLesson.id] = true;
      } else {
        delete copy[activeLesson.id];
      }
      return copy;
    });

    if (newStatus) {
      showToast('Lección marcada como completada');
      const newCompletedCount =
        Object.keys(completedLessonIds).length +
        (completedLessonIds[activeLesson.id] ? 0 : 1);
      if (newCompletedCount >= allLessons.length) {
        setIsFinalExamVisible(true);
      } else {
        handleNextLesson();
      }
    } else {
      showToast('Lección desmarcada');
    }

    try {
      await coursesApi.toggleLessonComplete(activeLesson.id);
    } catch (error) {
      // Revert on error
      setCompletedLessonIds(old => {
        const copy = { ...old };
        if (isCurrentlyCompleted) {
          copy[activeLesson.id] = true;
        } else {
          delete copy[activeLesson.id];
        }
        return copy;
      });
      showToast('Error al actualizar la lección');
    }
  };

  const handleExamPassed = (examResult: ExamSubmitResponse) => {
    setIsFinalExamVisible(false);
    setHasPassedExam(true);
    if (examResult.certificate) {
      setCertificate(examResult.certificate);
    }

    // Disparar Webhook hacia el backend para notificar al Admin
    const authUser = useAuthStore.getState().user;
    coursesApi.notifyCourseCompletedWebhook({
      courseId: course.id,
      userId: authUser?.id || examResult.certificate?.userId || '',
      studentName: authUser ? `${authUser.name || ''} ${authUser.lastname || ''}`.trim() : undefined,
      studentEmail: authUser?.email,
      courseTitle: course.title,
      score: examResult.score,
      certificateId: examResult.certificate?.id,
    }).catch(err => {
      console.warn('Error al disparar webhook de finalización:', err);
    });

    // Abrir modal de valoración y comentario
    setIsReviewModalVisible(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    setIsReviewModalVisible(false);
    try {
      await coursesApi.submitReview(course.id, { rating, comment });
      showToast('¡Gracias por tu valoración!');
    } catch {
      showToast('Valoración enviada');
    }

    // Luego de la valoración, abrir el certificado para ver y descargar
    if (!certificate) {
      try {
        const cert = await coursesApi.getCertificate(course.id);
        if (cert) setCertificate(cert);
      } catch {
        // ignore
      }
    }
    setIsCertificateModalVisible(true);
  };

  const handleReviewClose = async () => {
    setIsReviewModalVisible(false);
    if (!certificate) {
      try {
        const cert = await coursesApi.getCertificate(course.id);
        if (cert) setCertificate(cert);
      } catch {
        // ignore
      }
    }
    setIsCertificateModalVisible(true);
  };

  // Comment Handlers
  const handleAddComment = (content: string) => {
    if (!activeLesson) return;
    const newComment: CommentItem = {
      id: `c-user-${Date.now()}`,
      author: 'Tú (Estudiante)',
      avatarText: 'TU',
      role: 'student',
      timestamp: 'Ahora mismo',
      content,
      likes: 0,
      isLiked: false,
    };
    setLessonCommentsMap(prev => ({
      ...prev,
      [activeLesson.id]: [newComment, ...(prev[activeLesson.id] || [])],
    }));
  };

  const handleToggleLike = (commentId: string) => {
    if (!activeLesson) return;
    setLessonCommentsMap(prev => {
      const list = prev[activeLesson.id] || [];
      const updated = list.map(item => {
        if (item.id === commentId) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            likes: isLiked ? item.likes + 1 : Math.max(0, item.likes - 1),
          };
        }
        return item;
      });
      return { ...prev, [activeLesson.id]: updated };
    });
  };

  // Quiz Handlers
  const handleSelectOption = (idx: number) => {
    if (!activeLesson) return;
    setLessonQuizMap(prev => ({
      ...prev,
      [activeLesson.id]: {
        selected: idx,
        submitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleCheckQuiz = () => {
    if (!activeLesson) return;
    if (currentQuizState.selected === null) {
      Alert.alert(
        'Selecciona una opción',
        'Por favor elige una alternativa antes de comprobar.',
      );
      return;
    }
    const isCorrect =
      currentQuizState.selected === activeLesson.quiz.correctIndex;
    setLessonQuizMap(prev => ({
      ...prev,
      [activeLesson.id]: {
        selected: currentQuizState.selected,
        submitted: true,
        isCorrect,
      },
    }));
  };

  const handleResetQuiz = () => {
    if (!activeLesson) return;
    setLessonQuizMap(prev => ({
      ...prev,
      [activeLesson.id]: {
        selected: null,
        submitted: false,
        isCorrect: false,
      },
    }));
  };

  const handleGoBack = useCallback(() => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    setIsPlaying(false);

    if (cardLayout) {
      progress.value = withSpring(
        0,
        { damping: 24, stiffness: 150, mass: 0.8 },
        finished => {
          if (finished) {
            runOnJS(navigation.goBack)();
          }
        },
      );
    } else {
      navigation.goBack();
    }
  }, [cardLayout, navigation, progress]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleGoBack();
      return true;
    });
    return () => sub.remove();
  }, [handleGoBack]);

  const imageSource = course.imageUrl
    ? { uri: course.imageUrl }
    : require('../../../assets/courses/devops_banner.jpg');

  const isFullscreenShared = useSharedValue(false);
  useEffect(() => {
    isFullscreenShared.value = isFullscreen;
  }, [isFullscreen, isFullscreenShared]);

  // Animated styles
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1]),
  }));

  const heroAnimatedStyle = useAnimatedStyle(() => {
    const top = interpolate(progress.value, [0, 1], [startY, -scrollY.value]);
    const left = interpolate(progress.value, [0, 1], [startX, 0]);
    const width = interpolate(
      progress.value,
      [0, 1],
      [startWidth, SCREEN_WIDTH],
    );
    const height = interpolate(
      progress.value,
      [0, 1],
      [startHeight, HERO_HEIGHT],
    );
    const topRadius = interpolate(
      progress.value,
      [0, 1],
      [cardLayout?.startRadiusTop ?? radius.lg, 0],
    );
    const bottomRadius = interpolate(
      progress.value,
      [0, 1],
      [cardLayout?.startRadiusBottom ?? 0, 0],
    );

    return {
      position: 'absolute',
      top,
      left,
      width,
      height,
      borderTopLeftRadius: topRadius,
      borderTopRightRadius: topRadius,
      borderBottomLeftRadius: bottomRadius,
      borderBottomRightRadius: bottomRadius,
      overflow: 'hidden',
      zIndex: 10,
    };
  }, [
    progress,
    scrollY,
    startY,
    startX,
    startWidth,
    startHeight,
    SCREEN_WIDTH,
    cardLayout,
  ]);

  const tagsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.15],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const videoControlsStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.35, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const navStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.4, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(progress.value, [0, 1], [0.75, 1]) }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.35, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [60, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const bottomBarStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0.35, 1],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          progress.value,
          [0, 1],
          [80, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const progressFraction = Math.min(
    1,
    Math.max(0, currentTimeSec / (activeLesson?.durationSec || 1)),
  );
  const progressPercent = Math.round(progressFraction * 100);

  const renderVideoOverlayContent = () => {
    if (!isEnrolled) {
      return (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleEnroll}
          disabled={isEnrolling}
          style={[styles.unenrolledBannerOverlay, { paddingTop: insets.top }]}
        >
          <View style={styles.lockIconContainer}>
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.unenrolledBannerTitle}>
            Inscríbete para comenzar
          </Text>
          <Text style={styles.unenrolledBannerSubtitle}>
            Desbloquea todas las lecciones en video
          </Text>
        </TouchableOpacity>
      );
    }

    if (!activeLesson) {
      return (
        <View
          style={[styles.unenrolledBannerOverlay, { paddingTop: insets.top }]}
        >
          <View style={styles.lockIconContainer}>
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          </View>
          <Text style={styles.unenrolledBannerTitle}>Elige una lección</Text>
          <Text style={styles.unenrolledBannerSubtitle}>
            Selecciona un tema del temario para comenzar a reproducir
          </Text>
        </View>
      );
    }

    return (
      <CourseVideoPlayer
        activeLesson={activeLesson}
        activeLessonIndex={activeLessonIndex}
        totalLessons={allLessons.length}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        currentTimeSec={currentTimeSec}
        showControls={showControls}
        isFullscreen={isFullscreen}
        imageSource={imageSource}
        onTimeUpdate={handleTimeUpdate}
        onToggleControls={() => setShowControls(p => !p)}
        onTogglePlayPause={togglePlayPause}
        onRewind={handleRewind}
        onForward={handleForward}
        onCycleSpeed={handleCycleSpeed}
        onNextLesson={handleNextLesson}
        onOpenFullscreen={() => setIsFullscreen(true)}
        onCloseFullscreen={() => setIsFullscreen(false)}
        topInset={insets.top}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Animated.View
          pointerEvents="box-none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background },
            backdropStyle,
          ]}
        />
        <Animated.View style={heroAnimatedStyle}>
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </Animated.View>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: HERO_HEIGHT + spacing.md,
              paddingBottom: insets.bottom + 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={e => {
            scrollY.value = e.nativeEvent.contentOffset.y;
          }}
        >
          <Animated.View style={bodyStyle}>
            <CourseDetailSkeleton />
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Animated Backdrop */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors.background },
          backdropStyle,
        ]}
      />

      {/* Floating Hero Banner with Interactive Video Player */}
      <Animated.View style={heroAnimatedStyle}>
        {!isFullscreen && (
          <Image
            source={imageSource}
            style={styles.heroImage}
            resizeMode="cover"
          />
        )}

        {!isFullscreen && (
          <Animated.View
            pointerEvents="none"
            style={[styles.imageOverlayTags, tagsAnimatedStyle]}
          >
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{course.category}</Text>
            </View>
            <View style={styles.tagsRightGroup}>
              {hasPassedExam && (
                <View style={styles.completedTag}>
                  <CheckCircle2 size={11} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.completedTagText}>Terminado</Text>
                </View>
              )}
              <View style={styles.levelTag}>
                <Text style={styles.levelTagText}>{course.level}</Text>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={[StyleSheet.absoluteFill, !isFullscreen && videoControlsStyle]}
        >
          {!isFullscreen && (!isPlaying || !activeLesson) && (
            <ImageGradientOverlay />
          )}
          {renderVideoOverlayContent()}
        </Animated.View>
      </Animated.View>

      {/* Scrollable Content Body */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: HERO_HEIGHT + spacing.md,
            paddingBottom: insets.bottom + 100,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={e => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
      >
        <Animated.View style={bodyStyle}>
          {/* Active Lesson Featured Card */}
          {isEnrolled && activeLesson && (
            <View style={styles.activeLessonCard}>
              <View style={styles.activeLessonHeaderRow}>
                <View style={styles.lessonPlayingIndicator}>
                  <View
                    style={[
                      styles.pulseDot,
                      isPlaying && styles.pulseDotActive,
                    ]}
                  />
                  <Text style={styles.lessonPlayingText}>
                    {isPlaying
                      ? 'EN VIDEO / REPRODUCIENDO'
                      : 'LECCIÓN EN CURSO'}
                  </Text>
                </View>

                <Text style={styles.lessonCounterBadge}>
                  {activeLessonIndex + 1} de {allLessons.length}
                </Text>
              </View>

              <Text style={styles.activeLessonTitle}>{activeLesson.title}</Text>

              <View style={styles.activeLessonProgressRow}>
                <View style={styles.activeLessonProgressBar}>
                  <View
                    style={[
                      styles.activeLessonProgressFill,
                      { width: `${progressPercent}%` },
                    ]}
                  />
                </View>
                <Text style={styles.activeLessonProgressPercent}>
                  {progressPercent}%
                </Text>
              </View>

              <View style={styles.activeLessonActionsRow}>
                <TouchableOpacity
                  style={[
                    styles.activeLessonPlayBtn,
                    isPlaying && styles.activeLessonPlayBtnPlaying,
                  ]}
                  onPress={togglePlayPause}
                  activeOpacity={0.8}
                >
                  {isPlaying ? (
                    <>
                      <Pause size={15} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.activeLessonPlayBtnText}>
                        Pausar video
                      </Text>
                    </>
                  ) : (
                    <>
                      <Play size={15} color="#FFFFFF" fill="#FFFFFF" />
                      <Text style={styles.activeLessonPlayBtnText}>
                        Reanudar video
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {activeLessonIndex < allLessons.length - 1 && (
                  <TouchableOpacity
                    style={styles.activeLessonNextBtn}
                    onPress={handleNextLesson}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.activeLessonNextBtnText}>
                      Siguiente clase
                    </Text>
                    <SkipForward size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.activeLessonCompleteBtn,
                  completedLessonIds[activeLesson.id] &&
                    styles.activeLessonCompleteBtnActive,
                ]}
                onPress={handleMarkAsCompleted}
                activeOpacity={0.8}
              >
                <ShieldCheck
                  size={15}
                  color={
                    completedLessonIds[activeLesson.id]
                      ? colors.primary
                      : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.activeLessonCompleteBtnText,
                    completedLessonIds[activeLesson.id] &&
                      styles.activeLessonCompleteBtnTextActive,
                  ]}
                >
                  {completedLessonIds[activeLesson.id]
                    ? 'Lección completada'
                    : 'Marcar como completado'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Scope Indicator */}
          {isEnrolled && activeLesson && (
            <View style={styles.lessonScopeBanner}>
              <Text style={styles.lessonScopeTitle}>
                CONTENIDO DE LA LECCIÓN
              </Text>
              <Text style={styles.lessonScopeSubtitle} numberOfLines={1}>
                {activeLesson.title}
              </Text>
            </View>
          )}

          {/* Completed Course Status Banner */}
          {hasPassedExam && !activeLesson && (
            <View style={styles.courseCompletedBanner}>
              <View style={styles.courseCompletedBannerLeft}>
                <View style={styles.courseCompletedIconCircle}>
                  <CheckCircle2 size={16} color="#10B981" strokeWidth={2.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseCompletedBannerTitle}>
                    ¡Has completado este curso!
                  </Text>
                  <Text style={styles.courseCompletedBannerDesc}>
                    Examen final aprobado y certificado disponible
                  </Text>
                </View>
              </View>
              <View style={styles.completedTag}>
                <CheckCircle2 size={11} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.completedTagText}>Terminado</Text>
              </View>
            </View>
          )}

          {/* Navigation Pill Chips Bar */}
          <View style={styles.tabNavContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabNavScroll}
            >
              <TouchableOpacity
                style={[
                  styles.tabChip,
                  activeTab === 'syllabus' && styles.tabChipActive,
                ]}
                onPress={() => setActiveTab('syllabus')}
                activeOpacity={0.75}
              >
                <BookOpen
                  size={15}
                  color={
                    activeTab === 'syllabus' ? '#FFFFFF' : colors.textMuted
                  }
                />
                <Text
                  style={[
                    styles.tabChipText,
                    activeTab === 'syllabus' && styles.tabChipTextActive,
                  ]}
                >
                  Temario
                </Text>
              </TouchableOpacity>

              {isEnrolled && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.tabChip,
                      activeTab === 'resources' && styles.tabChipActive,
                    ]}
                    onPress={() => setActiveTab('resources')}
                    activeOpacity={0.75}
                  >
                    <FileText
                      size={15}
                      color={
                        activeTab === 'resources' ? '#FFFFFF' : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.tabChipText,
                        activeTab === 'resources' && styles.tabChipTextActive,
                      ]}
                    >
                      Recursos
                    </Text>
                    <View
                      style={[
                        styles.tabBadge,
                        activeTab === 'resources' && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          activeTab === 'resources' &&
                            styles.tabBadgeTextActive,
                        ]}
                      >
                        {activeLesson?.resources?.length || 0}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tabChip,
                      activeTab === 'comments' && styles.tabChipActive,
                    ]}
                    onPress={() => setActiveTab('comments')}
                    activeOpacity={0.75}
                  >
                    <MessageSquare
                      size={15}
                      color={
                        activeTab === 'comments' ? '#FFFFFF' : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.tabChipText,
                        activeTab === 'comments' && styles.tabChipTextActive,
                      ]}
                    >
                      Comentarios
                    </Text>
                    <View
                      style={[
                        styles.tabBadge,
                        activeTab === 'comments' && styles.tabBadgeActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.tabBadgeText,
                          activeTab === 'comments' && styles.tabBadgeTextActive,
                        ]}
                      >
                        {currentComments.length}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tabChip,
                      activeTab === 'exams' && styles.tabChipActive,
                    ]}
                    onPress={() => setActiveTab('exams')}
                    activeOpacity={0.75}
                  >
                    <FileQuestion
                      size={15}
                      color={
                        activeTab === 'exams' ? '#FFFFFF' : colors.textMuted
                      }
                    />
                    <Text
                      style={[
                        styles.tabChipText,
                        activeTab === 'exams' && styles.tabChipTextActive,
                      ]}
                    >
                      Exámenes
                    </Text>
                    {currentQuizState.submitted && (
                      <View
                        style={[
                          styles.tabBadge,
                          currentQuizState.isCorrect
                            ? styles.quizTabDone
                            : styles.quizTabFail,
                        ]}
                      >
                        <Text style={styles.tabBadgeTextQuiz}>
                          {currentQuizState.isCorrect ? '✓' : '!'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>

          {/* TAB CONTENTS */}
          {activeTab === 'syllabus' && (
            <CourseSyllabus
              course={courseData}
              modules={modules}
              allLessons={allLessons}
              activeLessonIndex={activeLessonIndex}
              isPlaying={isPlaying}
              completedLessonIds={completedLessonIds}
              lessonCommentsMap={lessonCommentsMap}
              lessonQuizMap={lessonQuizMap}
              onSelectLesson={handleSelectLesson}
              canTakeExam={
                Object.keys(completedLessonIds).length >= allLessons.length &&
                allLessons.length > 0
              }
              hasPassedExam={hasPassedExam}
              onTakeExam={() => setIsFinalExamVisible(true)}
              onViewCertificate={() => setIsCertificateModalVisible(true)}
            />
          )}

          {activeTab === 'resources' &&
            (activeLesson ? (
              <CourseResources
                activeLesson={activeLesson}
                activeLessonIndex={activeLessonIndex}
              />
            ) : (
              <View style={styles.emptyTabContainer}>
                <FileText size={48} color={colors.textMuted} strokeWidth={1} />
                <Text style={styles.emptyTabTitle}>
                  No hay lección seleccionada
                </Text>
                <Text style={styles.emptyTabText}>
                  Selecciona una lección desde el temario para ver los recursos.
                </Text>
              </View>
            ))}

          {activeTab === 'comments' &&
            (activeLesson ? (
              <CourseComments
                activeLesson={activeLesson}
                activeLessonIndex={activeLessonIndex}
                comments={currentComments}
                onAddComment={handleAddComment}
                onToggleLike={handleToggleLike}
              />
            ) : (
              <View style={styles.emptyTabContainer}>
                <MessageSquare
                  size={48}
                  color={colors.textMuted}
                  strokeWidth={1}
                />
                <Text style={styles.emptyTabTitle}>
                  No hay lección seleccionada
                </Text>
                <Text style={styles.emptyTabText}>
                  Selecciona una lección desde el temario para ver y dejar
                  comentarios.
                </Text>
              </View>
            ))}

          {activeTab === 'exams' &&
            (activeLesson && currentQuizState ? (
              <CourseQuiz
                activeLesson={activeLesson}
                activeLessonIndex={activeLessonIndex}
                totalLessons={allLessons.length}
                quizState={currentQuizState}
                onSelectOption={handleSelectOption}
                onCheckQuiz={handleCheckQuiz}
                onResetQuiz={handleResetQuiz}
                onNextLesson={handleNextLesson}
              />
            ) : (
              <View style={styles.emptyTabContainer}>
                <FileQuestion
                  size={48}
                  color={colors.textMuted}
                  strokeWidth={1}
                />
                <Text style={styles.emptyTabTitle}>
                  No hay lección seleccionada
                </Text>
                <Text style={styles.emptyTabText}>
                  Selecciona una lección desde el temario para realizar su
                  examen.
                </Text>
              </View>
            ))}
        </Animated.View>
      </ScrollView>

      {/* Animated Toast */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.toastContainer,
          {
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
            bottom: insets.bottom + 20,
          },
        ]}
      >
        <ShieldCheck size={18} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      {/* Floating Back and Share buttons */}
      <Animated.View
        style={[
          styles.floatingNav,
          { top: Math.max(insets.top - 12, spacing.xs) },
          navStyle,
        ]}
      >
        <TouchableOpacity
          style={styles.circleButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
          accessibilityLabel="Volver al catálogo"
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.4} />
        </TouchableOpacity>

        {hasPassedExam && (
          <View style={styles.floatingNavCompletedTag}>
            <CheckCircle2 size={12} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.floatingNavCompletedTagText}>Terminado</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => setIsShareModalVisible(true)}
          activeOpacity={0.8}
          accessibilityLabel="Compartir curso"
        >
          <Share2 size={18} color="#FFFFFF" strokeWidth={2.2} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Floating Action Bar */}
      {!isEnrolled && (
        <Animated.View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
            bottomBarStyle,
          ]}
        >
          <View style={styles.bottomBarContent}>
            <View style={styles.unenrolledBottomBarContainer}>
              <View style={styles.corporateAccessContainer}>
                <ShieldCheck size={24} color={colors.primary} />
                <View style={styles.corporateAccessTextContainer}>
                  <Text style={styles.corporateAccessTitle}>
                    Acceso Corporativo
                  </Text>
                  <Text style={styles.corporateAccessSubtitle}>
                    Incluido en tu plan
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.enrollCtaButtonSmall}
                onPress={handleEnroll}
                activeOpacity={0.85}
                disabled={isEnrolling}
              >
                {isEnrolling ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.enrollCtaTextSmall}>Inscribirme</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Professional Social Share Modal Bottom Sheet */}
      <CourseShareModal
        visible={isShareModalVisible}
        onClose={() => setIsShareModalVisible(false)}
        course={course}
        imageSource={imageSource}
      />

      <FinalExamModal
        visible={isFinalExamVisible}
        courseId={course.id}
        courseTitle={course.title}
        onClose={() => setIsFinalExamVisible(false)}
        onExamPassed={handleExamPassed}
      />

      <CourseReviewModal
        visible={isReviewModalVisible}
        onClose={handleReviewClose}
        onSubmit={handleReviewSubmit}
        courseTitle={course.title}
      />

      <CertificateModal
        visible={isCertificateModalVisible}
        courseId={course.id}
        courseTitle={course.title}
        certificate={certificate}
        onClose={() => setIsCertificateModalVisible(false)}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
    },
    heroImage: {
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
    studentsTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.sm,
    },
    studentsTagText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    floatingNav: {
      position: 'absolute',
      left: spacing.lg,
      right: spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 20,
    },
    circleButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.25)',
    },
    floatingNavCompletedTag: {
      backgroundColor: '#10B981',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 5,
      borderRadius: radius.full,
      shadowColor: '#10B981',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 4,
    },
    floatingNavCompletedTagText: {
      fontSize: 12,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    courseCompletedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#10B98112',
      borderWidth: 1.5,
      borderColor: '#10B98140',
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 12,
      marginBottom: 16,
      gap: 10,
    },
    courseCompletedBannerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    courseCompletedIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#10B98125',
      alignItems: 'center',
      justifyContent: 'center',
    },
    courseCompletedBannerTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 1,
    },
    courseCompletedBannerDesc: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 14,
    },
    activeLessonCard: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    activeLessonHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    lessonPlayingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pulseDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#94A3B8',
    },
    pulseDotActive: {
      backgroundColor: '#10B981',
    },
    lessonPlayingText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.5,
    },
    lessonCounterBadge: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    activeLessonTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 20,
      marginBottom: 10,
    },
    activeLessonProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    activeLessonProgressBar: {
      flex: 1,
      height: 6,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 3,
      overflow: 'hidden',
    },
    activeLessonProgressFill: {
      height: 6,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    activeLessonProgressPercent: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      width: 32,
      textAlign: 'right',
    },
    activeLessonActionsRow: {
      flexDirection: 'row',
      gap: 8,
      alignItems: 'center',
    },
    activeLessonPlayBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      borderRadius: 10,
    },
    activeLessonPlayBtnPlaying: {
      backgroundColor: '#0F172A',
    },
    activeLessonPlayBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    activeLessonNextBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    activeLessonNextBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    activeLessonCompleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
    },
    activeLessonCompleteBtnActive: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    activeLessonCompleteBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    activeLessonCompleteBtnTextActive: {
      color: colors.primary,
    },
    lessonScopeBanner: {
      backgroundColor: `${colors.primary}0F`,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 8,
      marginBottom: 16,
    },
    lessonScopeTitle: {
      fontSize: 10,
      fontWeight: '800',
      color: colors.primary,
      letterSpacing: 0.8,
    },
    lessonScopeSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
      marginTop: 2,
    },
    tabNavContainer: {
      marginBottom: 16,
      marginHorizontal: -spacing.lg,
    },
    tabNavScroll: {
      paddingHorizontal: spacing.lg,
      gap: 8,
    },
    tabChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tabChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabChipText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    tabBadge: {
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
    },
    tabBadgeActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    tabBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    tabBadgeTextActive: {
      color: '#FFFFFF',
    },
    quizTabDone: {
      backgroundColor: '#10B981',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 8,
    },
    quizTabFail: {
      backgroundColor: '#EF4444',
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 8,
    },
    tabBadgeTextQuiz: {
      fontSize: 10,
      color: '#FFFFFF',
      fontWeight: '800',
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 10,
    },
    bottomBarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    courseProgressPill: {
      flex: 1,
      gap: 4,
    },
    progressPercent: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
    },
    progressMiniTrack: {
      height: 5,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressMiniFill: {
      height: 5,
      backgroundColor: colors.primary,
      borderRadius: 3,
    },
    enrollCtaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    enrollCtaText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    enrollCtaTextLarge: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
    enrollCtaButtonLarge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: radius.md,
      marginTop: spacing.sm,
    },
    unenrolledBottomBarContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingTop: spacing.md,
    },
    corporateAccessContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    corporateAccessTextContainer: {
      flexDirection: 'column',
    },
    corporateAccessTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    corporateAccessSubtitle: {
      color: colors.textMuted,
      fontSize: 12,
    },
    enrollCtaButtonSmall: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    enrollCtaTextSmall: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    unenrolledBannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
    },
    lockIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },
    unenrolledBannerTitle: {
      color: '#FFFFFF',
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: 0.5,
      textAlign: 'center',
      marginBottom: 6,
    },
    unenrolledBannerSubtitle: {
      color: 'rgba(255, 255, 255, 0.8)',
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
    },
    unenrolledPriceContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    unenrolledPriceText: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    unenrolledSubText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    emptyTabContainer: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xl,
    },
    emptyTabTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
    },
    emptyTabText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    toastContainer: {
      position: 'absolute',
      alignSelf: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.full,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
      zIndex: 100,
      marginHorizontal: spacing.xl,
    },
    toastText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
      flexShrink: 1,
    },
  });
