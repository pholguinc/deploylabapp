import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import { useAchievements } from '../hooks/useAchievements';

// ─── Achievement Icon ─────────────────────────────────────────────────────────

function AchievementIcon({
  name,
  size = 26,
}: {
  readonly name?: string | null;
  readonly size?: number;
}) {
  const IconComponent = name
    ? (LucideIcons as any)[name] || LucideIcons.HelpCircle
    : LucideIcons.HelpCircle;
  return <IconComponent size={size} color="#ffffff" strokeWidth={2} />;
}

// ─── Skeleton item ────────────────────────────────────────────────────────────

function SkeletonCard({ colors }: { readonly colors: ThemeColors }) {
  const styles = getStyles(colors);
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonText} />
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentAchievements() {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { achievements, isLoading, error } = useAchievements();

  return (
    <>
      <Text style={styles.sectionTitle}>Logros recientes</Text>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.achievementsRow}>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} colors={colors} />
                ))
              : achievements.map(item => (
                  <View key={item.id} style={styles.achievementCard}>
                    <View style={[styles.achievementIconWrapper, { backgroundColor: item.color || '#6b7280' }]}>
                      <AchievementIcon name={item.icon} />
                    </View>
                    <Text style={styles.achievementLabel} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                ))}
            {/* Extra spinner while data loads in background */}
            {isLoading && (
              <ActivityIndicator
                style={styles.loadingIndicator}
                color={colors.primary}
              />
            )}
          </View>
        </ScrollView>
      )}
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
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
      borderRadius: radius.sm,
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
    errorText: {
      fontSize: 12,
      color: colors.danger ?? '#ef4444',
      textAlign: 'center',
      paddingVertical: spacing.sm,
    },
    skeletonCard: {
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
    skeletonIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.sm,
      backgroundColor: colors.surfaceAlt,
    },
    skeletonText: {
      width: 60,
      height: 10,
      borderRadius: 4,
      backgroundColor: colors.surfaceAlt,
    },
    loadingIndicator: {
      alignSelf: 'center',
      marginLeft: spacing.sm,
    },
  });
