import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Rocket,
} from 'lucide-react-native';
import { radius, spacing } from '../../../shared/theme';
import { useTheme } from '../../../shared/context/ThemeContext';
import { useAuthStore } from '../store/useAuthStore';

type Props = Readonly<{
  onLoginSuccess: () => void;
}>;

export default function LoginScreen({ onLoginSuccess }: Readonly<Props>) {
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const { login, isLoading, error: authError, clearError } = useAuthStore();

  const handleLogin = async () => {
    setLocalError(null);
    clearError();

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setLocalError('Ingresa tu correo electrónico.');
      return;
    }
    if (!password) {
      setLocalError('Ingresa tu contraseña.');
      return;
    }

    const success = await login({ email: cleanEmail, password });
    if (success) {
      onLoginSuccess();
    }
  };

  const displayedError = localError || authError;

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <View style={styles.header}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Rocket size={28} color={colors.textOnPrimary} strokeWidth={2.2} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Bienvenido de nuevo
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Inicia sesión para continuar aprendiendo en DeployLab
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Correo electrónico
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderColor: displayedError ? colors.danger : colors.border,
                },
              ]}>
              <Mail size={18} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="tucorreo@ejemplo.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  if (displayedError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              Contraseña
            </Text>
            <View
              style={[
                styles.inputWrapper,
                {
                  backgroundColor: colors.surface,
                  borderColor: displayedError ? colors.danger : colors.border,
                },
              ]}>
              <Lock size={18} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (displayedError) {
                    setLocalError(null);
                    clearError();
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {showPassword ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {displayedError ? (
            <View
              style={[
                styles.errorContainer,
                { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}40` },
              ]}>
              <AlertCircle size={16} color={colors.danger} strokeWidth={2.2} />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {displayedError}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.primary,
                opacity: isLoading ? 0.75 : 1,
              },
            ]}
            activeOpacity={0.85}
            disabled={isLoading}
            onPress={handleLogin}>
            {isLoading ? (
              <View style={styles.buttonInner}>
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
                <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>
                  Iniciando sesión...
                </Text>
              </View>
            ) : (
              <View style={styles.buttonInner}>
                <Text style={[styles.primaryButtonText, { color: colors.textOnPrimary }]}>
                  Iniciar sesión
                </Text>
                <ArrowRight size={18} color={colors.textOnPrimary} strokeWidth={2.5} />
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            disabled={isLoading}
            activeOpacity={0.7}>
            <Text style={[styles.linkText, { color: colors.primary }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            ¿Necesitas acceso? Contacta al administrador de tu organización.
          </Text>
        </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: 13,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    fontSize: 15,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    minHeight: 48,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  linkText: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
