import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Easing,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  ChevronRight,
  LogOut,
  Moon,
  Shield,
  Sun,
  User,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import { useAuthStore } from '../../auth';
import SettingsSkeleton from '../components/SettingsSkeleton';

type Props = Readonly<{
  onLogout: () => void;
  isLoading?: boolean;
}>;

export default function SettingsScreen({ onLogout, isLoading: isLoadingProp }: Readonly<Props>) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const user = useAuthStore(state => state.user);
  const styles = useMemo(() => getStyles(colors), [colors]);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [autoDeployEnabled, setAutoDeployEnabled] = useState(false);

  const [internalLoading, setInternalLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const loading = isLoadingProp ?? internalLoading;

  const headerOpacity = useRef(new RNAnimated.Value(0)).current;
  const headerTranslateY = useRef(new RNAnimated.Value(-12)).current;
  const profileOpacity = useRef(new RNAnimated.Value(0)).current;
  const profileTranslateY = useRef(new RNAnimated.Value(18)).current;
  const sectionsOpacity = useRef(new RNAnimated.Value(0)).current;
  const sectionsTranslateY = useRef(new RNAnimated.Value(18)).current;
  const logoutOpacity = useRef(new RNAnimated.Value(0)).current;
  const logoutTranslateY = useRef(new RNAnimated.Value(18)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 950);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      headerOpacity.setValue(0);
      headerTranslateY.setValue(-12);
      profileOpacity.setValue(0);
      profileTranslateY.setValue(18);
      sectionsOpacity.setValue(0);
      sectionsTranslateY.setValue(18);
      logoutOpacity.setValue(0);
      logoutTranslateY.setValue(18);

      const makeAnim = (opacity: RNAnimated.Value, translateY: RNAnimated.Value) =>
        RNAnimated.parallel([
          RNAnimated.timing(opacity, {
            toValue: 1,
            duration: 340,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          RNAnimated.timing(translateY, {
            toValue: 0,
            duration: 380,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]);

      RNAnimated.stagger(75, [
        makeAnim(headerOpacity, headerTranslateY),
        makeAnim(profileOpacity, profileTranslateY),
        makeAnim(sectionsOpacity, sectionsTranslateY),
        makeAnim(logoutOpacity, logoutTranslateY),
      ]).start();
    }
  }, [
    loading,
    headerOpacity,
    headerTranslateY,
    profileOpacity,
    profileTranslateY,
    sectionsOpacity,
    sectionsTranslateY,
    logoutOpacity,
    logoutTranslateY,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
      setRefreshing(false);
    }, 900);
  }, []);

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Pedro Holguin');
  const displayEmail = user?.email || 'pedro@deploylab.io';
  const displayRoles = user?.roles?.length ? user.roles.join(', ') : 'Estudiante DevOps';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'DL';

  if (loading && !refreshing) {
    return <SettingsSkeleton />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      <RNAnimated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}>
        <Text style={styles.title}>Perfil & Ajustes</Text>
        <Text style={styles.subtitle}>Tu cuenta de estudiante y preferencias</Text>
      </RNAnimated.View>

      <RNAnimated.View
        style={[
          styles.profileCard,
          {
            opacity: profileOpacity,
            transform: [{ translateY: profileTranslateY }],
          },
        ]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{displayRoles} • Activo</Text>
          </View>
        </View>
      </RNAnimated.View>

      <RNAnimated.View
        style={{
          gap: spacing.xl,
          opacity: sectionsOpacity,
          transform: [{ translateY: sectionsTranslateY }],
        }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={toggleTheme}>
              <View style={styles.rowLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isDark ? '#3B82F622' : '#F59E0B18' },
                  ]}>
                  {isDark ? (
                    <Moon size={18} color="#60A5FA" strokeWidth={2.2} />
                  ) : (
                    <Sun size={18} color="#F59E0B" strokeWidth={2.2} />
                  )}
                </View>
                <View>
                  <Text style={styles.rowTitle}>Tema de la aplicación</Text>
                  <Text style={styles.rowSubtitle}>
                    {isDark ? 'Modo Oscuro (Activo)' : 'Modo Claro (Activo)'}
                  </Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferencias de Aprendizaje</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}18` }]}>
                  <Bell size={18} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Recordatorio diario</Text>
                  <Text style={styles.rowSubtitle}>Mantener mi racha de estudio</Text>
                </View>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: `${colors.accent}18` }]}>
                  <Shield size={18} color={colors.accent} strokeWidth={2.2} />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Descarga solo por Wi-Fi</Text>
                  <Text style={styles.rowSubtitle}>Ahorrar datos móviles en videos</Text>
                </View>
              </View>
              <Switch
                value={autoDeployEnabled}
                onValueChange={setAutoDeployEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} activeOpacity={0.7}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
                  <User size={18} color={colors.text} strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.rowTitle}>Detalles del estudiante</Text>
                  <Text style={styles.rowSubtitle}>Editar nombre, correo y contraseña</Text>
                </View>
              </View>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </RNAnimated.View>

      <RNAnimated.View
        style={[
          {
            opacity: logoutOpacity,
            transform: [{ translateY: logoutTranslateY }],
          },
        ]}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={onLogout}>
          <LogOut size={18} color={colors.danger} strokeWidth={2} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </RNAnimated.View>
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
      gap: spacing.xs,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      color: colors.textOnPrimary,
      fontSize: 18,
      fontWeight: '800',
    },
    profileInfo: {
      flex: 1,
      gap: 3,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    profileEmail: {
      fontSize: 13,
      color: colors.textMuted,
    },
    roleBadge: {
      alignSelf: 'flex-start',
      backgroundColor: `${colors.primary}12`,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.sm,
      marginTop: 2,
    },
    roleText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    section: {
      gap: spacing.sm,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      flex: 1,
    },
    iconCircle: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    rowSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginLeft: 56 + spacing.md,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      backgroundColor: `${colors.danger}12`,
      borderWidth: 1,
      borderColor: `${colors.danger}30`,
      borderRadius: radius.md,
      paddingVertical: spacing.sm + 4,
      marginTop: spacing.sm,
    },
    logoutText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.danger,
    },
  });
