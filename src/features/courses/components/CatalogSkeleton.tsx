import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

const RADIUS_XS = 4;

export default function CatalogSkeleton() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}>
      {/* Header / Search */}
      <View style={styles.header}>
        <Skeleton width={180} height={28} borderRadius={radius.sm} style={styles.headerTitle} />
        <Skeleton width="100%" height={48} borderRadius={radius.lg} />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        {[1, 2, 3, 4].map(key => (
          <Skeleton
            key={key}
            width={85}
            height={36}
            borderRadius={radius.full}
            style={styles.categoryPill}
          />
        ))}
      </View>

      {/* Courses Section */}
      <View style={styles.coursesSection}>
        <View style={styles.sectionHeaderRow}>
          <Skeleton width={130} height={20} borderRadius={RADIUS_XS} />
          <Skeleton width={60} height={14} borderRadius={RADIUS_XS} />
        </View>

        <View style={styles.coursesList}>
          {[1, 2].map(key => (
            <View key={key} style={styles.courseCard}>
              <Skeleton width="100%" height={155} borderRadius={0} />
              <View style={styles.courseCardContent}>
                <Skeleton width="85%" height={18} borderRadius={RADIUS_XS} />
                <Skeleton width="95%" height={14} borderRadius={RADIUS_XS} style={styles.descLine} />
                <Skeleton width="70%" height={14} borderRadius={RADIUS_XS} style={styles.descLine} />
                
                <View style={styles.courseMetaRow}>
                  <Skeleton width={60} height={14} borderRadius={RADIUS_XS} />
                  <Skeleton width={70} height={14} borderRadius={RADIUS_XS} />
                  <Skeleton width={40} height={14} borderRadius={RADIUS_XS} />
                </View>

                <View style={styles.courseFooter}>
                  <View style={styles.instructorBlock}>
                    <Skeleton width={50} height={10} borderRadius={RADIUS_XS} />
                    <Skeleton width={90} height={14} borderRadius={RADIUS_XS} style={styles.instName} />
                  </View>
                  <Skeleton width={90} height={32} borderRadius={radius.sm} />
                </View>
              </View>
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
      gap: spacing.lg,
    },
    header: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    headerTitle: {
      marginBottom: spacing.xs,
    },
    categoriesContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    categoryPill: {
      borderWidth: 1,
      borderColor: colors.border,
    },
    coursesSection: {
      paddingHorizontal: spacing.lg,
      gap: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    coursesList: {
      gap: spacing.lg,
    },
    courseCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    courseCardContent: {
      padding: spacing.md,
    },
    descLine: {
      marginTop: spacing.xs,
    },
    courseMetaRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.sm + 4,
      marginBottom: spacing.xs,
    },
    courseFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    instructorBlock: {
      gap: 4,
    },
    instName: {
      marginTop: 2,
    },
  });
