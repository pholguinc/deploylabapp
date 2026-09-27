import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

const RADIUS_XS = 4;

export default function MyCoursesSkeleton() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.badgeLabelSkeleton}>
          <Skeleton width={110} height={20} borderRadius={radius.sm} />
        </View>
        <Skeleton width={160} height={28} borderRadius={radius.sm} style={styles.titleSkeleton} />
        <Skeleton width="80%" height={14} borderRadius={RADIUS_XS} style={styles.subtitleSkeleton} />
      </View>

      {/* Stats Summary Skeleton */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map(key => (
          <View key={key} style={styles.statCard}>
            <Skeleton width={40} height={28} borderRadius={radius.sm} />
            <Skeleton width={80} height={12} borderRadius={RADIUS_XS} style={styles.statLabelSkeleton} />
          </View>
        ))}
      </View>

      {/* Active Courses Skeleton */}
      <View style={styles.section}>
        <Skeleton width={150} height={20} borderRadius={RADIUS_XS} style={styles.sectionTitleSkeleton} />

        <View style={styles.coursesList}>
          {[1, 2, 3].map(key => (
            <View key={key} style={styles.courseCard}>
              <View style={styles.cardTop}>
                <Skeleton width={70} height={70} borderRadius={radius.md} />
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.badgeRow}>
                    <Skeleton width={60} height={20} borderRadius={radius.full} />
                  </View>
                  <Skeleton width="100%" height={18} borderRadius={RADIUS_XS} style={styles.courseTitleSkeleton} />
                  <Skeleton width="70%" height={18} borderRadius={RADIUS_XS} style={styles.courseTitleSkeleton2} />
                </View>
              </View>

              <View style={styles.progressBlock}>
                <View style={styles.progressRow}>
                  <Skeleton width={120} height={12} borderRadius={RADIUS_XS} />
                  <Skeleton width={30} height={12} borderRadius={RADIUS_XS} />
                </View>
                <Skeleton width="100%" height={8} borderRadius={4} />
              </View>

              <View style={styles.currentLessonBlock}>
                <Skeleton width={100} height={12} borderRadius={RADIUS_XS} />
                <Skeleton width="90%" height={14} borderRadius={RADIUS_XS} style={styles.currentLessonTextSkeleton} />
              </View>

              <Skeleton width="100%" height={44} borderRadius={radius.md} style={styles.buttonSkeleton} />
            </View>
          ))}
        </View>
      </View>
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
      gap: 4,
    },
    badgeLabelSkeleton: {
      marginBottom: spacing.xs,
    },
    titleSkeleton: {
      marginBottom: 2,
    },
    subtitleSkeleton: {
      marginTop: 2,
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
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statLabelSkeleton: {
      marginTop: spacing.xs,
    },
    section: {
      gap: spacing.md,
    },
    sectionTitleSkeleton: {
      marginBottom: spacing.xs,
    },
    coursesList: {
      gap: spacing.lg,
    },
    courseCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    cardTop: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    cardHeaderInfo: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    badgeRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    courseTitleSkeleton: {
      marginBottom: 4,
    },
    courseTitleSkeleton2: {},
    progressBlock: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    currentLessonBlock: {
      marginTop: spacing.md,
      backgroundColor: colors.surfaceAlt,
      padding: spacing.md,
      borderRadius: radius.md,
      gap: 6,
    },
    currentLessonTextSkeleton: {
      marginTop: 2,
    },
    buttonSkeleton: {
      marginTop: spacing.md,
    },
  });
