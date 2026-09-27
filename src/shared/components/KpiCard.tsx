import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, ThemeColors } from '../theme';

type Trend = 'up' | 'down' | 'flat';

type Props = Readonly<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: Trend;
  trendLabel?: string;
  accentColor?: string;
}>;

function KpiCard({
  icon,
  label,
  value,
  trend,
  trendLabel,
  accentColor,
}: Readonly<Props>) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const activeAccentColor = accentColor ?? colors.primary;

  const trendColor = useMemo(() => {
    if (!trend) return colors.textMuted;
    if (trend === 'up') return colors.accent;
    if (trend === 'down') return colors.danger;
    return colors.textMuted;
  }, [trend, colors]);

  const renderTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp size={12} color={trendColor} strokeWidth={2.5} />;
    if (trend === 'down') return <TrendingDown size={12} color={trendColor} strokeWidth={2.5} />;
    return <Minus size={12} color={trendColor} strokeWidth={2.5} />;
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconBadge, { backgroundColor: `${activeAccentColor}22` }]}>
          {typeof icon === 'string' ? (
            <Text style={styles.icon}>{icon}</Text>
          ) : (
            icon
          )}
        </View>
        {trend && trendLabel ? (
          <View style={styles.trendRow}>
            {renderTrendIcon()}
            <Text style={[styles.trend, { color: trendColor }]} numberOfLines={1}>
              {trendLabel}
            </Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      width: '48%',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.sm + 4,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    iconBadge: {
      width: 32,
      height: 32,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      fontSize: 16,
    },
    value: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
    },
    label: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    trendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      flexShrink: 1,
    },
    trend: {
      fontSize: 10,
      fontWeight: '700',
      flexShrink: 1,
      textAlign: 'right',
    },
  });

export default KpiCard;
