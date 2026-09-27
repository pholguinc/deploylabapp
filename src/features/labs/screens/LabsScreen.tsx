import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Play,
  Server,
  Terminal,
} from 'lucide-react-native';
import { radius, spacing } from '../../../shared/theme';
import { useTheme } from '../../../shared/context/ThemeContext';

type Environment = Readonly<{
  name: string;
  version: string;
  status: 'online' | 'deploying';
  url: string;
  uptime: string;
}>;

type LabItem = Readonly<{
  id: string;
  title: string;
  level: string;
  duration: string;
  completed: boolean;
  tag: string;
}>;

const ENVIRONMENTS: readonly Environment[] = [
  {
    name: 'Producción',
    version: 'v2.4.1',
    status: 'online',
    url: 'api.deploylab.io',
    uptime: '99.98%',
  },
  {
    name: 'Staging',
    version: 'v2.5.0-rc1',
    status: 'online',
    url: 'staging.deploylab.io',
    uptime: '99.85%',
  },
  {
    name: 'QA & Sandbox',
    version: 'v2.5.0-alpha',
    status: 'deploying',
    url: 'qa.deploylab.io',
    uptime: '98.50%',
  },
];

const LABS: readonly LabItem[] = [
  {
    id: 'lab-1',
    title: 'Pipeline CI/CD con GitHub Actions',
    level: 'Intermedio',
    duration: '25 min',
    completed: true,
    tag: 'CI/CD',
  },
  {
    id: 'lab-2',
    title: 'Optimización de imágenes Docker Multi-stage',
    level: 'Avanzado',
    duration: '40 min',
    completed: false,
    tag: 'Docker',
  },
  {
    id: 'lab-3',
    title: 'Despliegue Blue-Green con Kubernetes Ingress',
    level: 'Experto',
    duration: '45 min',
    completed: false,
    tag: 'K8s',
  },
  {
    id: 'lab-4',
    title: 'Monitoreo y Métricas en tiempo real con Prometheus',
    level: 'Intermedio',
    duration: '30 min',
    completed: false,
    tag: 'Observabilidad',
  },
];

export function LabsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + 90 },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary}15` }]}>
          <Terminal size={22} color={colors.primary} strokeWidth={2.2} />
        </View>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Labs & Entornos</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Gestiona tus servidores y prácticas
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Entornos en vivo</Text>
        <View style={styles.envGrid}>
          {ENVIRONMENTS.map(env => (
            <View
              key={env.name}
              style={[
                styles.envCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.envCardHeader}>
                <View style={styles.envBadgeWrapper}>
                  <Server size={16} color={colors.primary} />
                  <Text style={[styles.envName, { color: colors.text }]}>{env.name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.surfaceAlt }]}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          env.status === 'online' ? colors.accent : '#F59E0B',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          env.status === 'online' ? colors.accent : '#F59E0B',
                      },
                    ]}>
                    {env.status === 'online' ? 'En línea' : 'Desplegando'}
                  </Text>
                </View>
              </View>

              <View style={styles.envMetaRow}>
                <Text style={[styles.envUrl, { color: colors.textMuted }]}>{env.url}</Text>
                <Text style={[styles.envVersion, { color: colors.primary }]}>{env.version}</Text>
              </View>

              <View style={[styles.envFooter, { borderTopColor: colors.border }]}>
                <Text style={[styles.uptimeText, { color: colors.textMuted }]}>
                  Disponibilidad: {env.uptime}
                </Text>
                <ExternalLink size={14} color={colors.textMuted} />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Laboratorios prácticos</Text>
        <View style={styles.labsList}>
          {LABS.map(lab => (
            <View
              key={lab.id}
              style={[
                styles.labCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.labHeader}>
                <View style={[styles.tagBadge, { backgroundColor: `${colors.primary}12` }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{lab.tag}</Text>
                </View>
                <View style={styles.durationRow}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={[styles.durationText, { color: colors.textMuted }]}>
                    {lab.duration}
                  </Text>
                </View>
              </View>

              <Text style={[styles.labTitle, { color: colors.text }]}>{lab.title}</Text>

              <View style={styles.labFooter}>
                <Text style={[styles.levelText, { color: colors.textMuted }]}>
                  Nivel: {lab.level}
                </Text>
                {lab.completed ? (
                  <View style={styles.completedBadge}>
                    <CheckCircle2 size={14} color={colors.accent} strokeWidth={2.2} />
                    <Text style={[styles.completedText, { color: colors.accent }]}>
                      Completado
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.startButton, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}>
                    <Play size={12} color={colors.textOnPrimary} fill={colors.textOnPrimary} />
                    <Text style={[styles.startButtonText, { color: colors.textOnPrimary }]}>
                      Iniciar
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default LabsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  envGrid: {
    gap: spacing.sm,
  },
  envCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  envCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  envBadgeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  envName: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  envMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  envUrl: {
    fontSize: 13,
    fontFamily: 'Courier',
  },
  envVersion: {
    fontSize: 12,
    fontWeight: '600',
  },
  envFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: spacing.xs,
  },
  uptimeText: {
    fontSize: 11,
  },
  labsList: {
    gap: spacing.sm,
  },
  labCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  labTitle: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  labFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  levelText: {
    fontSize: 12,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
