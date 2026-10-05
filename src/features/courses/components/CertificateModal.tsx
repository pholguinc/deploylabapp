import React from 'react';
import {
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Award,
  CheckCircle2,
  Download,
  Share2,
  X,
} from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';
import coursesApi, { CertificateData } from '../services/coursesApi';

interface CertificateModalProps {
  visible: boolean;
  courseId: string;
  courseTitle: string;
  certificate: CertificateData | null;
  onClose: () => void;
}

export default function CertificateModal({
  visible,
  courseId,
  courseTitle,
  certificate,
  onClose,
}: CertificateModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const studentName = certificate?.user
    ? `${certificate.user.name ?? ''} ${certificate.user.lastname ?? ''}`.trim() ||
      certificate.user.email
    : 'Estudiante';

  const issuedDate = certificate?.issuedAt
    ? new Date(certificate.issuedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('es-ES');

  const handleDownload = async () => {
    const downloadUrl = coursesApi.getCertificateDownloadUrl(courseId);
    try {
      await Linking.openURL(downloadUrl);
    } catch {
      // In case Linking fails
    }
  };

  const handleShare = async () => {
    const downloadUrl = coursesApi.getCertificateDownloadUrl(courseId);
    try {
      await Share.share({
        title: `Mi Certificado - ${courseTitle}`,
        message: `¡He completado satisfactoriamente el curso "${courseTitle}" con una calificación de ${certificate?.score ?? 20}/20 en DeployLab!\nDescarga mi certificado aquí: ${downloadUrl}`,
      });
    } catch {
      // Ignore
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header with Title & Close button */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderSpacer} />
            <Text style={styles.modalHeaderTitle}>Certificación Oficial</Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <X size={18} color={colors.textMuted} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Certificate View */}
          <View style={styles.certificatePaper}>
            <View style={styles.certificateBorderInner}>
              {/* Badge */}
              <View style={styles.badgeWrapper}>
                <Award size={36} color="#D97706" />
              </View>

              <Text style={styles.certSubtitle}>DEPLOYLAB ACADEMY</Text>
              <Text style={styles.certMainTitle}>CERTIFICADO DE ACREDITACIÓN</Text>

              <View style={styles.divider} />

              <Text style={styles.certIntro}>Otorgado con orgullo a:</Text>
              <Text style={styles.studentNameText}>{studentName}</Text>

              <Text style={styles.certDetailText}>
                Por haber completado con excelencia el curso y aprobado el examen final de:
              </Text>

              <Text style={styles.courseTitleText}>{courseTitle}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>CALIFICACIÓN</Text>
                  <Text style={styles.metaValue}>
                    {certificate?.score ?? 20} / 20 pts
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>FECHA DE EMISIÓN</Text>
                  <Text style={styles.metaValue}>{issuedDate}</Text>
                </View>
              </View>

              <View style={styles.verifiedRow}>
                <CheckCircle2 size={14} color="#10B981" strokeWidth={2.5} />
                <Text style={styles.verifiedText}>
                  Certificado verificado oficialmente por DeployLab
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.downloadBtn}
              onPress={handleDownload}
              activeOpacity={0.8}>
              <Download size={18} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.downloadBtnText}>Descargar Certificado (PDF)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShare}
              activeOpacity={0.8}>
              <Share2 size={17} color={colors.text} strokeWidth={2.2} />
              <Text style={styles.shareBtnText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.72)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.lg,
    },
    modalCard: {
      backgroundColor: colors.surface,
      width: '100%',
      maxWidth: 420,
      borderRadius: 26,
      paddingHorizontal: spacing.md + 4,
      paddingTop: spacing.md,
      paddingBottom: spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    modalHeader: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm + 2,
    },
    modalHeaderSpacer: {
      width: 32,
      height: 32,
    },
    modalHeaderTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    certificatePaper: {
      width: '100%',
      backgroundColor: '#FAF6EE',
      borderRadius: 18,
      padding: 6,
      borderWidth: 2,
      borderColor: '#E5A93C',
      shadowColor: '#B8860B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    certificateBorderInner: {
      borderWidth: 1.5,
      borderColor: '#D4AF3750',
      borderStyle: 'dashed',
      borderRadius: 12,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md + 2,
      alignItems: 'center',
    },
    badgeWrapper: {
      width: 56,
      height: 56,
      borderRadius: radius.full,
      backgroundColor: '#FEF3C7',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xs,
      borderWidth: 1,
      borderColor: '#F59E0B',
    },
    certSubtitle: {
      fontSize: 10,
      letterSpacing: 2,
      fontWeight: '800',
      color: '#B45309',
      marginBottom: 2,
    },
    certMainTitle: {
      fontSize: 16,
      fontWeight: '900',
      color: '#1E293B',
      letterSpacing: 1,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    divider: {
      width: 50,
      height: 2,
      backgroundColor: '#D97706',
      marginBottom: spacing.sm,
    },
    certIntro: {
      fontSize: 11,
      color: '#64748B',
      fontStyle: 'italic',
      marginBottom: 2,
    },
    studentNameText: {
      fontSize: 18,
      fontWeight: '800',
      color: '#0F172A',
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    certDetailText: {
      fontSize: 11,
      color: '#64748B',
      textAlign: 'center',
      marginBottom: 4,
      paddingHorizontal: spacing.sm,
    },
    courseTitleText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#1E293B',
      textAlign: 'center',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      backgroundColor: '#FFFFFF',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginBottom: spacing.sm,
    },
    metaItem: {
      alignItems: 'center',
    },
    metaLabel: {
      fontSize: 9,
      letterSpacing: 0.5,
      fontWeight: '700',
      color: '#94A3B8',
    },
    metaValue: {
      fontSize: 12,
      fontWeight: '800',
      color: '#0F172A',
      marginTop: 2,
    },
    verifiedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    verifiedText: {
      fontSize: 10,
      color: '#059669',
      fontWeight: '600',
    },
    actionsContainer: {
      width: '100%',
      marginTop: spacing.md + 4,
      gap: spacing.sm,
    },
    downloadBtn: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
      borderRadius: radius.full,
      gap: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    downloadBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: radius.full,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      gap: spacing.xs,
    },
    shareBtnText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
  });
