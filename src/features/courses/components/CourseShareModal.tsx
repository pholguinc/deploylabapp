import React, { useState } from 'react';
import {
  Alert,
  Clipboard,
  Image,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Check, Copy, Share2, X } from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { ThemeColors } from '../../../shared/theme';
import type { Course } from '../types';

type CourseShareModalProps = Readonly<{
  visible: boolean;
  onClose: () => void;
  course: Course;
  imageSource: any;
}>;

export default function CourseShareModal({
  visible,
  onClose,
  course,
  imageSource,
}: CourseShareModalProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = `https://deploylab.dev/courses/${course.id}`;
  const shareMessage = `🚀 ¡Estoy aprendiendo "${course.title}" en DeployLab! Te comparto la ruta para dominar DevOps y Cloud:`;

  let instructorName = 'Sin instructor';
  if (course.instructor) {
    if (typeof course.instructor === 'object') {
      instructorName = `${course.instructor.name} ${course.instructor.lastname}`;
    } else {
      instructorName = course.instructor;
    }
  }

  const handleShareWhatsApp = () => {
    const text = `${shareMessage}\n${shareUrl}`;
    const deepLink = `whatsapp://send?text=${encodeURIComponent(text)}`;
    const webLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    Linking.openURL(deepLink).catch(() => {
      Linking.openURL(webLink).catch(() => {
        Alert.alert('WhatsApp', 'No se pudo abrir WhatsApp en este dispositivo.');
      });
    });
  };

  const handleShareX = () => {
    const text = `Estoy aprendiendo "${course.title}" en @DeployLab. 🚀 ¡Ruta recomendada para DevOps y Cloud!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}&hashtags=DevOps,DeployLab,Cloud`;
    Linking.openURL(url).catch(() => {
      Alert.alert('X (Twitter)', 'No se pudo abrir el enlace de X.');
    });
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('LinkedIn', 'No se pudo abrir LinkedIn.');
    });
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Facebook', 'No se pudo abrir Facebook.');
    });
  };

  const handleCopyLink = () => {
    Clipboard.setString(shareUrl);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 2500);
  };

  const handleShareNative = async () => {
    try {
      await Share.share({
        title: course.title,
        message: `${shareMessage}\n${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      // Handled silently
    }
  };

  const styles = getStyles(colors, isDark);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.shareBackdrop}
        activeOpacity={1}
        onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.shareSheetContainer,
            { paddingBottom: Math.max(insets.bottom, 16) + 14 },
          ]}>
          {/* Grabber Indicator */}
          <View style={styles.shareGrabber} />

          {/* Modal Header */}
          <View style={styles.shareHeader}>
            <View style={styles.shareHeaderLeft}>
              <Text style={styles.shareTitle}>Compartir Curso</Text>
              <Text style={styles.shareSubtitle}>
                Difunde tu ruta de aprendizaje en tus redes favoritas
              </Text>
            </View>
            <TouchableOpacity
              style={styles.shareCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Mini Course Preview Card */}
          <View style={styles.sharePreviewCard}>
            <Image
              source={imageSource}
              style={styles.sharePreviewImage}
              resizeMode="cover"
            />
            <View style={styles.sharePreviewInfo}>
              <View style={styles.shareBadgePill}>
                <Text style={styles.sharePreviewBadge} numberOfLines={1}>
                  {course.level.toUpperCase()} • {course.category || 'DEVOPS'}
                </Text>
              </View>
              <Text style={styles.sharePreviewTitle} numberOfLines={2}>
                {course.title}
              </Text>
              <Text style={styles.sharePreviewInstructor} numberOfLines={1}>
                {instructorName}
              </Text>
            </View>
          </View>

          {/* Social Networks Row (WhatsApp, LinkedIn, X, Facebook) */}
          <Text style={styles.shareSectionLabel}>COMPARTIR DIRECTO</Text>
          <View style={styles.socialGridRow}>
            {/* WhatsApp */}
            <TouchableOpacity
              style={styles.socialItem}
              onPress={handleShareWhatsApp}
              activeOpacity={0.75}>
              <View style={[styles.socialIconBox, styles.socialBoxWhatsApp]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="#25D366">
                  <Path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.183 8.183 0 0 1-5.82 2.41h-.01c-1.49 0-2.95-.4-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24h.01zm-3.56 3.96c-.2 0-.42.02-.63.09-.27.09-.59.3-.77.58-.23.36-.67 1.05-.67 2.22 0 1.25.91 2.45 1.04 2.62.13.17 1.76 2.76 4.34 3.77.61.24 1.09.39 1.46.51.62.2 1.18.17 1.62.11.5-.07 1.54-.63 1.75-1.24.22-.61.22-1.14.15-1.25-.07-.11-.25-.18-.52-.31-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.7 1.01-.86 1.23-.16.22-.32.25-.59.11-.27-.14-1.15-.42-2.18-1.35-.81-.72-1.35-1.61-1.51-1.88-.16-.27-.02-.42.12-.55.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.84-2.03-.22-.53-.45-.46-.62-.47-.16-.01-.35-.01-.54-.01z" />
                </Svg>
              </View>
              <Text style={styles.socialLabel}>WhatsApp</Text>
              <Text style={styles.socialSubtext}>Chat</Text>
            </TouchableOpacity>

            {/* LinkedIn */}
            <TouchableOpacity
              style={styles.socialItem}
              onPress={handleShareLinkedIn}
              activeOpacity={0.75}>
              <View style={[styles.socialIconBox, styles.socialBoxLinkedIn]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="#0A66C2">
                  <Path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.94 0 1.7-.76 1.7-1.7s-.76-1.7-1.7-1.7-1.7.76-1.7 1.7.76 1.7 1.7 1.7m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                </Svg>
              </View>
              <Text style={styles.socialLabel}>LinkedIn</Text>
              <Text style={styles.socialSubtext}>Red Pro</Text>
            </TouchableOpacity>

            {/* X (Twitter) */}
            <TouchableOpacity
              style={styles.socialItem}
              onPress={handleShareX}
              activeOpacity={0.75}>
              <View style={[styles.socialIconBox, styles.socialBoxX]}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill={colors.text}>
                  <Path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </Svg>
              </View>
              <Text style={styles.socialLabel}>X</Text>
              <Text style={styles.socialSubtext}>Post</Text>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity
              style={styles.socialItem}
              onPress={handleShareFacebook}
              activeOpacity={0.75}>
              <View style={[styles.socialIconBox, styles.socialBoxFacebook]}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="#1877F2">
                  <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </Svg>
              </View>
              <Text style={styles.socialLabel}>Facebook</Text>
              <Text style={styles.socialSubtext}>Feed</Text>
            </TouchableOpacity>
          </View>

          {/* Direct Copy Link Container */}
          <Text style={styles.shareSectionLabel}>ENLACE DIRECTO</Text>
          <View style={styles.shareCopyRow}>
            <View style={styles.shareUrlBox}>
              <Text style={styles.shareUrlText} numberOfLines={1}>
                {shareUrl}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.shareCopyBtn,
                copiedLink && styles.shareCopyBtnSuccess,
              ]}
              onPress={handleCopyLink}
              activeOpacity={0.8}>
              {copiedLink ? (
                <>
                  <Check size={16} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.shareCopyBtnText}>¡Copiado!</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color="#FFFFFF" strokeWidth={2.2} />
                  <Text style={styles.shareCopyBtnText}>Copiar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Native OS Share Button */}
          <TouchableOpacity
            style={styles.shareNativeBtn}
            onPress={handleShareNative}
            activeOpacity={0.8}>
            <Share2 size={16} color={colors.text} strokeWidth={2.2} />
            <Text style={styles.shareNativeBtnText}>
              Más opciones para compartir (Sistema)
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) =>
  StyleSheet.create({
    shareBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      justifyContent: 'flex-end',
    },
    shareSheetContainer: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 20,
    },
    shareGrabber: {
      width: 44,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      alignSelf: 'center',
      marginBottom: 16,
    },
    shareHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    shareHeaderLeft: {
      flex: 1,
      marginRight: 12,
    },
    shareTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    shareSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
      lineHeight: 16,
    },
    shareCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sharePreviewCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 10,
      marginBottom: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sharePreviewImage: {
      width: 54,
      height: 54,
      borderRadius: 12,
      marginRight: 12,
      backgroundColor: colors.surface,
    },
    sharePreviewInfo: {
      flex: 1,
    },
    shareBadgePill: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(99, 102, 241, 0.12)',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 6,
      marginBottom: 4,
    },
    sharePreviewBadge: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      letterSpacing: 0.6,
    },
    sharePreviewTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      lineHeight: 17,
    },
    sharePreviewInstructor: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    shareSectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    socialGridRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 4,
    },
    socialItem: {
      alignItems: 'center',
      flex: 1,
    },
    socialIconBox: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
      borderWidth: 1.5,
    },
    socialBoxWhatsApp: {
      backgroundColor: 'rgba(37, 211, 102, 0.12)',
      borderColor: 'rgba(37, 211, 102, 0.35)',
    },
    socialBoxLinkedIn: {
      backgroundColor: 'rgba(10, 102, 194, 0.12)',
      borderColor: 'rgba(10, 102, 194, 0.35)',
    },
    socialBoxX: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.08)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(15, 23, 42, 0.2)',
    },
    socialBoxFacebook: {
      backgroundColor: 'rgba(24, 119, 242, 0.12)',
      borderColor: 'rgba(24, 119, 242, 0.35)',
    },
    socialLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.text,
    },
    socialSubtext: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 1,
    },
    shareCopyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 14,
      padding: 6,
      paddingLeft: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 12,
    },
    shareUrlBox: {
      flex: 1,
      marginRight: 8,
    },
    shareUrlText: {
      fontSize: 12,
      color: colors.textMuted,
    },
    shareCopyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
    },
    shareCopyBtnSuccess: {
      backgroundColor: '#10B981',
    },
    shareCopyBtnText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    shareNativeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    shareNativeBtnText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
  });
