import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Sparkles,
  Zap,
} from 'lucide-react-native';
import KpiCard from '../../../shared/components/KpiCard';
import ProgressBar from '../../../shared/components/ProgressBar';
import { useTheme } from '../../../shared/context/ThemeContext';
import type { Course } from '../../courses/types';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import { useAuthStore } from '../../auth';
import DashboardSkeleton from '../components/DashboardSkeleton';
import RecentAchievements from '../components/RecentAchievements';

type Props = Readonly<{
  onLogout: () => void;
  onNavigateToProfile?: () => void;
  onNotificationsPress?: () => void;
  hasUnreadNotifications?: boolean;
  onContinueCourse?: (course: Course) => void;
  isLoading?: boolean;
}>;

const CONTINUE_LEARNING = {
  title: 'CI/CD con GitHub Actions',
  module: 'Módulo 4 de 7 · Pipelines multi-stage',
  progress: 0.65,
};



export default function DashboardScreen({
  onLogout,
  onNavigateToProfile,
  onNotificationsPress,
  hasUnreadNotifications = true,
  onContinueCourse,
  isLoading: isLoadingProp,
}: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const user = useAuthStore(state => state.user);
  const styles = useMemo(() => getStyles(colors), [colors]);

  const [internalLoading, setInternalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loading = isLoadingProp ?? internalLoading;

  // Staggered animated values for initial screen entrance
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-12)).current;
  const kpisOpacity = useRef(new Animated.Value(0)).current;
  const kpisTranslateY = useRef(new Animated.Value(18)).current;
  const continueOpacity = useRef(new Animated.Value(0)).current;
  const continueTranslateY = useRef(new Animated.Value(18)).current;
  const achievementsOpacity = useRef(new Animated.Value(0)).current;
  const achievementsTranslateY = useRef(new Animated.Value(18)).current;
  const activityOpacity = useRef(new Animated.Value(0)).current;
  const activityTranslateY = useRef(new Animated.Value(18)).current;

  // Simulate initial screen data loading with smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 950);

    return () => clearTimeout(timer);
  }, []);

  // Trigger staggered entrance animation whenever content finishes loading
  useEffect(() => {
    if (!loading) {
      headerOpacity.setValue(0);
      headerTranslateY.setValue(-12);
      kpisOpacity.setValue(0);
      kpisTranslateY.setValue(18);
      continueOpacity.setValue(0);
      continueTranslateY.setValue(18);
      achievementsOpacity.setValue(0);
      achievementsTranslateY.setValue(18);
      activityOpacity.setValue(0);
      activityTranslateY.setValue(18);

      const makeAnim = (opacity: Animated.Value, translateY: Animated.Value) =>
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);

      Animated.stagger(75, [
        makeAnim(headerOpacity, headerTranslateY),
        makeAnim(kpisOpacity, kpisTranslateY),
        makeAnim(continueOpacity, continueTranslateY),
        makeAnim(achievementsOpacity, achievementsTranslateY),
        makeAnim(activityOpacity, activityTranslateY),
      ]).start();
    }
  }, [
    loading,
    headerOpacity,
    headerTranslateY,
    kpisOpacity,
    kpisTranslateY,
    continueOpacity,
    continueTranslateY,
    achievementsOpacity,
    achievementsTranslateY,
    activityOpacity,
    activityTranslateY,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
      setRefreshing(false);
    }, 900);
  }, []);

  const kpis = useMemo(
    () => [
      {
        icon: <Flame size={18} color={colors.accent} strokeWidth={2.2} />,
        label: 'Racha de aprendizaje',
        value: '12 días',
        trend: 'up' as const,
        trendLabel: '+3 vs. sem pasada',
        accentColor: colors.accent,
      },
      {
        icon: <FlaskConical size={18} color={colors.primary} strokeWidth={2.2} />,
        label: 'Labs completados',
        value: '34/50',
        trend: 'up' as const,
        trendLabel: '+5 este mes',
        accentColor: colors.primary,
      },
      {
        icon: <GraduationCap size={18} color={colors.primary} strokeWidth={2.2} />,
        label: 'Cursos completados',
        value: '5/12',
        trend: 'flat' as const,
        trendLabel: 'Sin cambios',
        accentColor: colors.primary,
      },
      {
        icon: <Zap size={18} color={colors.accent} strokeWidth={2.2} />,
        label: 'Puntos XP',
        value: '2,450',
        trend: 'up' as const,
        trendLabel: '+180 sem',
        accentColor: colors.accent,
      },
    ],
    [colors],
  );

  const recentActivity = useMemo(
    () => [
      {
        icon: <CheckCircle2 size={18} color={colors.accent} strokeWidth={2.2} />,
        title: 'Lab completado',
        detail: 'Despliegue con Kubernetes',
        time: 'Hace 2 h',
      },
      {
        icon: <BookOpen size={18} color={colors.primary} strokeWidth={2.2} />,
        title: 'Lección finalizada',
        detail: 'Infraestructura como código',
        time: 'Ayer',
      },
      {
        icon: <Award size={18} color="#f59e0b" strokeWidth={2.2} />,
        title: 'Insignia obtenida',
        detail: 'CI/CD Iniciado',
        time: 'Hace 2 días',
      },
    ],
    [colors],
  );

  if (loading && !refreshing) {
    return <DashboardSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}>
        <View>
          <View style={styles.greetingRow}>
            <Text style={styles.greeting}>Hola, {user?.name || 'futuro DevOps'}</Text>
            <Sparkles size={16} color={colors.accent} />
          </View>
          <Text style={styles.subGreeting}>Tu progreso de hoy</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={onNotificationsPress}>
            <Bell size={20} color={colors.text} strokeWidth={2} />
            {hasUnreadNotifications ? <View style={styles.notificationDot} /> : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={onNavigateToProfile ?? onLogout}>
            <Text style={styles.avatarText}>PH</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* KPI Grid */}
      <Animated.View
        style={[
          styles.kpiGrid,
          {
            opacity: kpisOpacity,
            transform: [{ translateY: kpisTranslateY }],
          },
        ]}>
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </Animated.View>

      {/* Continue Learning */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: continueOpacity,
            transform: [{ translateY: continueTranslateY }],
          },
        ]}>
        <Text style={styles.sectionTitle}>Continúa aprendiendo</Text>
        <View style={styles.continueCard}>
          <View style={styles.continueHeader}>
            <View style={styles.continueIconBadge}>
              <GitBranch size={22} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.flexShrink}>
              <Text style={styles.continueTitle}>{CONTINUE_LEARNING.title}</Text>
              <Text style={styles.continueModule}>{CONTINUE_LEARNING.module}</Text>
            </View>
          </View>
          <ProgressBar
            progress={CONTINUE_LEARNING.progress}
            color={colors.primary}
            trackColor={colors.surfaceAlt}
          />
          <View style={styles.continueFooter}>
            <Text style={styles.continuePercent}>
              {Math.round(CONTINUE_LEARNING.progress * 100)}% completado
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              activeOpacity={0.8}
              onPress={() => {
                const course = {
                  id: 'c-cicd',
                  title: CONTINUE_LEARNING.title,
                  category: 'CI/CD',
                  description: '',
                  level: 'Intermedio',
                  duration: '0h',
                  lessonsCount: 7,
                  studentsCount: 0,
                  rating: 5,
                  instructor: '',
                  accentColor: colors.primary,
                } as Course;
                onContinueCourse?.(course);
              }}>
              <Text style={styles.continueButtonText}>Continuar</Text>
              <ChevronRight size={14} color={colors.textOnPrimary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Achievements */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: achievementsOpacity,
            transform: [{ translateY: achievementsTranslateY }],
          },
        ]}>
        <RecentAchievements />
      </Animated.View>

      {/* Recent Activity */}
      <Animated.View
        style={[
          styles.section,
          {
            opacity: activityOpacity,
            transform: [{ translateY: activityTranslateY }],
          },
        ]}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.activityList}>
          {recentActivity.map(item => (
            <View key={item.title + item.time} style={styles.activityRow}>
              <View style={styles.activityIconWrapper}>{item.icon}</View>
              <View style={styles.flexShrink}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDetail}>{item.detail}</Text>
              </View>
              <Text style={styles.activityTime}>{item.time}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    greeting: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    subGreeting: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationDot: {
      position: 'absolute',
      top: 10,
      right: 11,
      width: 8,
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      borderColor: colors.surface,
    },
    avatarButton: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.textOnPrimary,
      fontWeight: '700',
      fontSize: 13,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.sm,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    continueCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
    },
    continueHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    continueIconBadge: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    continueModule: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    continueFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    continuePercent: {
      fontSize: 12,
      color: colors.textMuted,
    },
    continueButton: {
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 3,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    continueButtonText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    achievementsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingRight: spacing.lg,
    },
    achievementCard: {
      width: 96,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs + 2,
    },
    achievementIconWrapper: {
      width: 36,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    achievementLabel: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '500',
      color: colors.textMuted,
      textAlign: 'center',
    },
    activityList: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm + 2,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    activityIconWrapper: {
      width: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activityTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    activityDetail: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 1,
    },
    activityTime: {
      fontSize: 11,
      color: colors.textMuted,
      marginLeft: 'auto',
    },
    flexShrink: {
      flexShrink: 1,
    },
  });
