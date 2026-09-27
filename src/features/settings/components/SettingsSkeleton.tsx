import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../../shared/components/Skeleton';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

const RADIUS_XS = 4;

export default function SettingsSkeleton() {
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
      
      <View style={styles.header}>
        <Skeleton width={160} height={28} borderRadius={radius.sm} style={styles.titleSkeleton} />
        <Skeleton width="80%" height={14} borderRadius={RADIUS_XS} style={styles.subtitleSkeleton} />
      </View>

      <View style={styles.profileCard}>
        <Skeleton width={60} height={60} borderRadius={30} />
        <View style={styles.profileInfo}>
          <Skeleton width={120} height={20} borderRadius={RADIUS_XS} style={styles.profileNameSkeleton} />
          <Skeleton width={160} height={14} borderRadius={RADIUS_XS} style={styles.profileEmailSkeleton} />
          <Skeleton width={130} height={22} borderRadius={radius.sm} />
        </View>
      </View>

      {[1, 2].map(sectionKey => (
        <View key={sectionKey} style={styles.section}>
          <Skeleton width={100} height={16} borderRadius={RADIUS_XS} style={styles.sectionTitleSkeleton} />
          <View style={styles.card}>
            {[1, 2].map((rowKey, index) => (
              <View key={rowKey}>
                <View style={styles.row}>
                  <View style={styles.rowLeft}>
                    <Skeleton width={36} height={36} borderRadius={18} />
                    <View style={styles.rowTextGroup}>
                      <Skeleton width={140} height={16} borderRadius={RADIUS_XS} style={styles.rowTitleSkeleton} />
                      <Skeleton width={180} height={14} borderRadius={RADIUS_XS} />
                    </View>
                  </View>
                  <Skeleton width={40} height={24} borderRadius={12} />
                </View>
                {index === 0 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.section}>
        <Skeleton width={100} height={16} borderRadius={RADIUS_XS} style={styles.sectionTitleSkeleton} />
        <Skeleton width="100%" height={60} borderRadius={radius.lg} />
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
      gap: spacing.lg,
    },
    header: {
      gap: 4,
    },
    titleSkeleton: {
      marginBottom: 2,
    },
    subtitleSkeleton: {
      marginTop: 2,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      gap: spacing.md,
    },
    profileInfo: {
      flex: 1,
      gap: 2,
    },
    profileNameSkeleton: {
      marginBottom: 2,
    },
    profileEmailSkeleton: {
      marginBottom: 6,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitleSkeleton: {
      marginBottom: 4,
      marginLeft: spacing.xs,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    rowTextGroup: {
      gap: 4,
      flex: 1,
    },
    rowTitleSkeleton: {
      marginBottom: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginLeft: spacing.md + 36 + spacing.md,
    },
  });
