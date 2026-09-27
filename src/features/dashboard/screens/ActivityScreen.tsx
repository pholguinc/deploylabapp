import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  CheckCircle2,
  GitCommit,
  RotateCcw,
  Timer,
  Zap,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

type DeploymentLog = Readonly<{
  id: string;
  commitMessage: string;
  commitHash: string;
  branch: string;
  env: string;
  status: 'success' | 'failed' | 'running';
  duration: string;
  timeAgo: string;
}>;

const LOGS: readonly DeploymentLog[] = [
  {
    id: 'dep-1',
    commitMessage: 'feat(auth): add biometrics & token refresh',
    commitHash: '8f94a2b',
    branch: 'main',
    env: 'Producción',
    status: 'success',
    duration: '1m 18s',
    timeAgo: 'Hace 12 min',
  },
  {
    id: 'dep-2',
    commitMessage: 'fix(api): resolve timeout in webhook handler',
    commitHash: '3d72b1a',
    branch: 'staging',
    env: 'Staging',
    status: 'success',
    duration: '2m 04s',
    timeAgo: 'Hace 1h',
  },
  {
    id: 'dep-3',
    commitMessage: 'test(e2e): update cypress test suite',
    commitHash: '1a56e9c',
    branch: 'qa-tests',
    env: 'QA & Sandbox',
    status: 'failed',
    duration: '45s',
    timeAgo: 'Hace 3h',
  },
  {
    id: 'dep-4',
    commitMessage: 'refactor(ui): update color palette & dark support',
    commitHash: 'c4e912f',
    branch: 'feature/theme',
    env: 'Staging',
    status: 'success',
    duration: '1m 32s',
    timeAgo: 'Hace 5h',
  },
  {
    id: 'dep-5',
    commitMessage: 'chore(deps): bump react-native & safe area context',
    commitHash: '992a01b',
    branch: 'main',
    env: 'Producción',
    status: 'success',
    duration: '1m 12s',
    timeAgo: 'Ayer',
  },
];

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const renderStatusBadge = (status: DeploymentLog['status']) => {
    if (status === 'success') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: `${colors.accent}18` }]}>
          <CheckCircle2 size={12} color={colors.accent} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: colors.accent }]}>Éxito</Text>
        </View>
      );
    }
    if (status === 'failed') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: `${colors.danger}18` }]}>
          <AlertCircle size={12} color={colors.danger} strokeWidth={2.5} />
          <Text style={[styles.statusText, { color: colors.danger }]}>Falló</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: `${colors.primary}18` }]}>
        <RotateCcw size={12} color={colors.primary} strokeWidth={2.5} />
        <Text style={[styles.statusText, { color: colors.primary }]}>En curso</Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Zap size={22} color={colors.accent} strokeWidth={2.2} />
        </View>
        <View>
          <Text style={styles.title}>Actividad & Pipelines</Text>
          <Text style={styles.subtitle}>Registro histórico de tus despliegues</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Despliegues</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>98.4%</Text>
          <Text style={styles.statLabel}>Tasa de éxito</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>1m 24s</Text>
          <Text style={styles.statLabel}>Promedio build</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historial reciente</Text>
        <View style={styles.logsList}>
          {LOGS.map(log => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logTopRow}>
                <View style={styles.envTag}>
                  <Text style={styles.envTagText}>{log.env}</Text>
                </View>
                {renderStatusBadge(log.status)}
              </View>

              <Text style={styles.commitMessage} numberOfLines={2}>
                {log.commitMessage}
              </Text>

              <View style={styles.logBottomRow}>
                <View style={styles.commitMeta}>
                  <GitCommit size={13} color={colors.textMuted} />
                  <Text style={styles.commitHash}>{log.commitHash}</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.branchName}>{log.branch}</Text>
                </View>

                <View style={styles.timeMeta}>
                  <Timer size={12} color={colors.textMuted} />
                  <Text style={styles.durationText}>{log.duration}</Text>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.timeAgoText}>{log.timeAgo}</Text>
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
      paddingHorizontal: spacing.lg,
      gap: spacing.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: `${colors.accent}15`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
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
      padding: spacing.md,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    statLabel: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    logsList: {
      gap: spacing.sm,
    },
    logCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.xs,
    },
    logTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    envTag: {
      backgroundColor: colors.surfaceAlt,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    envTagText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
    },
    commitMessage: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 19,
    },
    logBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    commitMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    commitHash: {
      fontSize: 11,
      fontFamily: 'Courier',
      color: colors.primary,
      fontWeight: '600',
    },
    bullet: {
      fontSize: 11,
      color: colors.textMuted,
    },
    branchName: {
      fontSize: 12,
      color: colors.textMuted,
    },
    timeMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    durationText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    timeAgoText: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
