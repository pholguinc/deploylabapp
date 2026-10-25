import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, BookCheck, Timer } from 'lucide-react-native';
import ProgressBar from '../../../shared/components/ProgressBar';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import { useMyIndicators } from '../hooks/useMyIndicators';
import type { IndicatorCode, MyIndicator } from '../types/indicators';

// ─── Presentación por indicador ───────────────────────────────────────────────

const INDICATOR_UI: Record<
  IndicatorCode,
  {
    title: string;
    Icon: typeof BookCheck;
    detail: (num: number, den: number) => string;
    pendingHint: string;
  }
> = {
  'IND-01': {
    title: 'Respuestas correctas',
    Icon: BookCheck,
    detail: (num, den) => `${num} de ${den} ítems correctos`,
    pendingHint: 'Rinde un examen final para medir tu comprensión teórica.',
  },
  'IND-02': {
    title: 'Tiempo promedio de despliegue',
    Icon: Timer,
    detail: (num, den) => `${num} min en ${den} tareas`,
    pendingHint: 'Se registra cuando el docente califica tu examen práctico.',
  },
  'IND-03': {
    title: 'Incidencias resueltas',
    Icon: AlertTriangle,
    detail: (num, den) => `${num} de ${den} incidencias inyectadas`,
    pendingHint: 'Se registra cuando el docente califica tu examen práctico.',
  },
};

function formatValue(indicator: MyIndicator): string {
  if (indicator.value === null) return 'Pendiente';
  return indicator.unit === '%'
    ? `${indicator.value}%`
    : `${indicator.value} min`;
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function IndicatorCard({
  indicator,
  colors,
}: {
  readonly indicator: MyIndicator;
  readonly colors: ThemeColors;
}) {
  const styles = getStyles(colors);
  const ui = INDICATOR_UI[indicator.code];
  const accent = indicator.code === 'IND-02' ? '#f59e0b' : colors.accent;
  const hasValue = indicator.value !== null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBadge, { backgroundColor: `${accent}18` }]}>
          <ui.Icon size={18} color={accent} strokeWidth={2.2} />
        </View>
        <View style={styles.flexShrink}>
          <Text style={styles.cardTitle}>{ui.title}</Text>
          <Text style={styles.cardDimension}>
            {indicator.code} · {indicator.dimension}
          </Text>
        </View>
        <Text
          style={[
            styles.value,
            { color: hasValue ? colors.text : colors.textMuted },
          ]}>
          {formatValue(indicator)}
        </Text>
      </View>

      {hasValue && indicator.unit === '%' && (
        <ProgressBar
          progress={(indicator.value ?? 0) / 100}
          color={accent}
          trackColor={colors.surfaceAlt}
          height={6}
        />
      )}

      {indicator.history.length > 1 && (
        <HistoryBars indicator={indicator} color={accent} colors={colors} />
      )}

      <Text style={styles.detail}>
        {hasValue
          ? `${ui.detail(indicator.totalNumerator, indicator.totalDenominator)} · ${indicator.evaluations} ${indicator.evaluations === 1 ? 'evaluación' : 'evaluaciones'}${indicator.betterWhen === 'lower' ? ' · menor es mejor' : ''}`
          : ui.pendingHint}
      </Text>
      <Text style={styles.formula}>{indicator.formula}</Text>
    </View>
  );
}

// ─── Historial por evaluación ─────────────────────────────────────────────────

function HistoryBars({
  indicator,
  color,
  colors,
}: {
  readonly indicator: MyIndicator;
  readonly color: string;
  readonly colors: ThemeColors;
}) {
  const styles = getStyles(colors);
  const values = indicator.history.map(h => h.value ?? 0);
  // Porcentajes sobre 100; minutos relativos al mayor tiempo registrado
  const max = indicator.unit === '%' ? 100 : Math.max(...values, 1);

  return (
    <View style={styles.historyRow}>
      {indicator.history.map((h, i) => (
        <View key={h.attemptId} style={styles.historyItem}>
          <View style={[styles.historyTrack, { backgroundColor: colors.surfaceAlt }]}>
            <View
              style={[
                styles.historyFill,
                {
                  height: `${Math.max(4, ((h.value ?? 0) / max) * 100)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={styles.historyLabel}>E{i + 1}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LearningIndicators() {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const { indicators, isLoading, error } = useMyIndicators();

  return (
    <>
      <Text style={styles.sectionTitle}>Mis indicadores de aprendizaje</Text>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={[styles.card, styles.skeletonCard]} />
          ))}
        </View>
      ) : (
        <View style={styles.list}>
          {indicators.map(indicator => (
            <IndicatorCard
              key={indicator.code}
              indicator={indicator}
              colors={colors}
            />
          ))}
        </View>
      )}
    </>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    list: {
      gap: spacing.sm,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    skeletonCard: {
      height: 96,
      backgroundColor: colors.surfaceAlt,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flexShrink: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    cardDimension: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    value: {
      fontSize: 18,
      fontWeight: '800',
    },
    detail: {
      fontSize: 12,
      color: colors.textMuted,
    },
    formula: {
      fontSize: 11,
      fontFamily: 'Courier',
      color: colors.textMuted,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    historyItem: {
      alignItems: 'center',
      gap: 2,
    },
    historyTrack: {
      width: 14,
      height: 40,
      borderRadius: radius.sm,
      justifyContent: 'flex-end',
      overflow: 'hidden',
    },
    historyFill: {
      width: '100%',
      borderRadius: radius.sm,
    },
    historyLabel: {
      fontSize: 9,
      color: colors.textMuted,
    },
    errorText: {
      fontSize: 13,
      color: colors.danger,
    },
  });
