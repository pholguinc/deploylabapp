import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, GraduationCap, LayoutDashboard, User } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing, ThemeColors } from '../theme';

export type TabKey = 'dashboard' | 'catalog' | 'my-courses' | 'settings';

type TabItem = Readonly<{
  key: TabKey;
  label: string;
  icon: (active: boolean, colors: ThemeColors) => React.ReactNode;
}>;

type Props = Readonly<{
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}>;

const TABS: readonly TabItem[] = [
  {
    key: 'dashboard',
    label: 'Inicio',
    icon: (active: boolean, colors: ThemeColors) => (
      <LayoutDashboard
        size={22}
        color={active ? colors.primary : colors.textMuted}
        strokeWidth={active ? 2.4 : 1.8}
      />
    ),
  },
  {
    key: 'catalog',
    label: 'Catálogo',
    icon: (active: boolean, colors: ThemeColors) => (
      <BookOpen
        size={22}
        color={active ? colors.primary : colors.textMuted}
        strokeWidth={active ? 2.4 : 1.8}
      />
    ),
  },
  {
    key: 'my-courses',
    label: 'Mis Cursos',
    icon: (active: boolean, colors: ThemeColors) => (
      <GraduationCap
        size={22}
        color={active ? colors.primary : colors.textMuted}
        strokeWidth={active ? 2.4 : 1.8}
      />
    ),
  },
  {
    key: 'settings',
    label: 'Perfil',
    icon: (active: boolean, colors: ThemeColors) => (
      <User
        size={22}
        color={active ? colors.primary : colors.textMuted}
        strokeWidth={active ? 2.4 : 1.8}
      />
    ),
  },
];

type TabButtonProps = {
  tab: TabItem;
  isActive: boolean;
  onPress: () => void;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
};

function TabButton({ tab, isActive, onPress, colors, styles }: Readonly<TabButtonProps>) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.88,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 160,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.spring(dotAnim, {
        toValue: 1,
        friction: 5,
        tension: 180,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dotAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, scaleAnim, dotAnim]);

  return (
    <TouchableOpacity
      style={styles.tabButton}
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}>
      <Animated.View
        style={[
          styles.iconWrapper,
          isActive && styles.iconWrapperActive,
          { transform: [{ scale: scaleAnim }] },
        ]}>
        {tab.icon(isActive, colors)}
      </Animated.View>
      <Text style={[styles.label, isActive && styles.labelActive]}>
        {tab.label}
      </Text>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: dotAnim,
            transform: [{ scale: dotAnim }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

function BottomNav({ currentTab, onSelectTab }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);
  const bottomPadding = insets.bottom > 0 ? insets.bottom : spacing.sm;

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <View style={styles.tabRow}>
        {TABS.map(tab => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={currentTab === tab.key}
            onPress={() => onSelectTab(tab.key)}
            colors={colors}
            styles={styles}
          />
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.xs + 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 8,
    },
    tabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    tabButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 2,
    },
    iconWrapper: {
      width: 38,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
    },
    iconWrapperActive: {
      backgroundColor: `${colors.primary}12`,
    },
    label: {
      fontSize: 11,
      fontWeight: '500',
      color: colors.textMuted,
      marginTop: 2,
    },
    labelActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    activeIndicator: {
      width: 4,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      marginTop: 3,
    },
    inactiveIndicator: {
      width: 4,
      height: 4,
      marginTop: 3,
    },
  });

export default BottomNav;
