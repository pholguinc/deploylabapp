import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing } from '../../../shared/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 260;

export default function CourseDetailSkeleton() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Section Skeleton */}
      <View style={[styles.hero, { height: HERO_HEIGHT, backgroundColor: colors.surfaceAlt }]}>
        <Skeleton width="100%" height="100%" borderRadius={0} style={{ backgroundColor: colors.border }} />
        
        {/* Back Button Skeleton */}
        <View style={[styles.backBtn, { top: insets.top + spacing.sm }]}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ backgroundColor: colors.border }} />
        </View>
        
        {/* Tags Skeleton */}
        <View style={styles.tagsContainer}>
          <Skeleton width={80} height={28} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
          <Skeleton width={100} height={28} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
        </View>
      </View>

      {/* Body Content Skeleton */}
      <View style={styles.content}>
        {/* Active Lesson Card Skeleton */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <View style={styles.cardHeader}>
            <Skeleton width={120} height={20} style={{ backgroundColor: colors.border }} />
            <Skeleton width={60} height={20} style={{ backgroundColor: colors.border }} />
          </View>
          <Skeleton width="80%" height={24} style={[styles.title, { backgroundColor: colors.border }]} />
          
          <View style={styles.progressRow}>
            <Skeleton width="80%" height={8} borderRadius={4} style={{ backgroundColor: colors.border }} />
            <Skeleton width={30} height={16} style={{ backgroundColor: colors.border }} />
          </View>

          <View style={styles.actionRow}>
            <Skeleton width={130} height={36} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
            <Skeleton width={110} height={36} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
          </View>
        </View>

        {/* Tab Navigation Skeleton */}
        <View style={styles.tabsRow}>
          <Skeleton width={90} height={36} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
          <Skeleton width={90} height={36} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
          <Skeleton width={90} height={36} borderRadius={radius.full} style={{ backgroundColor: colors.border }} />
        </View>

        {/* Syllabus / Content List Skeleton */}
        <View style={styles.list}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.listItem, { borderColor: colors.border }]}>
              <View style={styles.listIcon}>
                <Skeleton width={40} height={40} borderRadius={radius.md} style={{ backgroundColor: colors.border }} />
              </View>
              <View style={styles.listContent}>
                <Skeleton width="90%" height={16} style={{ backgroundColor: colors.border }} />
                <Skeleton width="40%" height={12} style={{ marginTop: spacing.xs, backgroundColor: colors.border }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    width: '100%',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: spacing.lg,
  },
  tagsContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  list: {
    gap: spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  listIcon: {
    marginRight: spacing.md,
  },
  listContent: {
    flex: 1,
  },
});
