import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

const RADIUS_XS = 4;

export default function DashboardSkeleton() {
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
        <View style={styles.headerTextGroup}>
          <Skeleton width={160} height={22} borderRadius={radius.sm} />
          <Skeleton
            width={110}
            height={14}
            borderRadius={RADIUS_XS}
            style={styles.subGreetingSkeleton}
          />
        </View>
        <View style={styles.headerActions}>
          <Skeleton width={44} height={44} borderRadius={radius.full} />
          <Skeleton width={44} height={44} borderRadius={radius.full} />
        </View>
      </View>

      {/* KPI Grid Skeleton */}
      <View style={styles.kpiGrid}>
        {[1, 2, 3, 4].map(key => (
          <View key={key} style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Skeleton width={32} height={32} borderRadius={radius.sm} />
              <Skeleton width={52} height={14} borderRadius={RADIUS_XS} />
            </View>
            <Skeleton
              width={75}
              height={22}
              borderRadius={RADIUS_XS}
              style={styles.kpiValueSkeleton}
            />
            <Skeleton
              width={100}
              height={12}
              borderRadius={RADIUS_XS}
              style={styles.kpiLabelSkeleton}
            />
          </View>
        ))}
      </View>

      {/* Continue Learning Skeleton */}
      <View style={styles.section}>
        <Skeleton width={160} height={16} borderRadius={RADIUS_XS} />
        <View style={styles.continueCard}>
          <View style={styles.continueHeader}>
            <Skeleton width={44} height={44} borderRadius={radius.md} />
            <View style={styles.continueTextGroup}>
              <Skeleton width={180} height={16} borderRadius={RADIUS_XS} />
              <Skeleton
                width={130}
                height={12}
                borderRadius={RADIUS_XS}
                style={styles.continueModuleSkeleton}
              />
            </View>
          </View>
          <Skeleton width="100%" height={8} borderRadius={4} />
          <View style={styles.continueFooter}>
            <Skeleton width={95} height={14} borderRadius={RADIUS_XS} />
            <Skeleton width={88} height={32} borderRadius={radius.sm} />
          </View>
        </View>
      </View>

      {/* Achievements Skeleton */}
      <View style={styles.section}>
        <Skeleton width={140} height={16} borderRadius={RADIUS_XS} />
        <View style={styles.achievementsRow}>
          {[1, 2, 3, 4].map(key => (
            <View key={key} style={styles.achievementCard}>
              <Skeleton width={36} height={36} borderRadius={18} />
              <Skeleton
                width={64}
                height={12}
                borderRadius={RADIUS_XS}
                style={styles.achievementLabelSkeleton}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Recent Activity Skeleton */}
      <View style={styles.section}>
        <Skeleton width={150} height={16} borderRadius={RADIUS_XS} />
        <View style={styles.activityList}>
          {[1, 2, 3].map((key, index) => (
            <View
              key={key}
              style={[
                styles.activityRow,
                index === 2 ? styles.activityRowLast : null,
              ]}>
              <Skeleton width={24} height={24} borderRadius={12} />
              <View style={styles.activityTextGroup}>
                <Skeleton width={130} height={14} borderRadius={RADIUS_XS} />
                <Skeleton
                  width={90}
                  height={11}
                  borderRadius={RADIUS_XS}
                  style={styles.activityDetailSkeleton}
                />
              </View>
              <Skeleton
                width={48}
                height={12}
                borderRadius={RADIUS_XS}
                style={styles.activityTimeSkeleton}
              />
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTextGroup: {
      gap: 2,
    },
    subGreetingSkeleton: {
      marginTop: 6,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    kpiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: spacing.sm,
    },
    kpiCard: {
      width: '48%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.sm + 4,
    },
    kpiTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    kpiValueSkeleton: {
      marginTop: spacing.sm + 2,
    },
    kpiLabelSkeleton: {
      marginTop: 6,
    },
    section: {
      gap: spacing.sm,
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
    continueTextGroup: {
      flexShrink: 1,
      gap: 4,
    },
    continueModuleSkeleton: {
      marginTop: 2,
    },
    continueFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    achievementsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
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
    achievementLabelSkeleton: {
      marginTop: 4,
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
      paddingVertical: spacing.sm + 4,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    activityRowLast: {
      borderBottomWidth: 0,
    },
    activityTextGroup: {
      flexShrink: 1,
    },
    activityDetailSkeleton: {
      marginTop: 4,
    },
    activityTimeSkeleton: {
      marginLeft: 'auto',
    },
  });
