import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Code2, Download, FileText } from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { ThemeColors } from '../../../shared/theme';
import type { CourseResource, VideoLesson } from '../types';

type Props = Readonly<{
  activeLesson: VideoLesson;
  activeLessonIndex: number;
}>;

export default function CourseResources({ activeLesson, activeLessonIndex }: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const handleDownloadResource = (res: CourseResource) => {
    Alert.alert('Recurso Descargado', `Se ha guardado "${res.title}" (${res.size}) en tus descargas.`);
  };

  return (
    <View style={styles.tabContentSection}>
      <View style={styles.tabIntroBox}>
        <Download size={20} color={colors.primary} />
        <View style={styles.tabIntroTextCol}>
          <Text style={styles.tabIntroTitle}>
            Recursos de la Lección {activeLessonIndex + 1}
          </Text>
          <Text style={styles.tabIntroSubtitle}>
            Archivos, guías y snippets correspondientes a: "{activeLesson.title}".
          </Text>
        </View>
      </View>

      {activeLesson.resources.length > 0 ? (
        activeLesson.resources.map(res => (
          <View key={res.id} style={styles.resourceCard}>
            <View style={styles.resourceIconWrapper}>
              {res.type === 'pdf' ? (
                <FileText size={22} color="#EF4444" />
              ) : res.type === 'repo' ? (
                <Code2 size={22} color={colors.primary} />
              ) : (
                <Download size={22} color={colors.accent} />
              )}
            </View>

            <View style={styles.resourceInfoCol}>
              <View style={styles.resourceBadgeRow}>
                <Text style={styles.resourceTypeBadge}>{res.type.toUpperCase()}</Text>
                <Text style={styles.resourceSizeText}>{res.size}</Text>
              </View>
              <Text style={styles.resourceTitle}>{res.title}</Text>
              <Text style={styles.resourceDesc}>{res.description}</Text>

              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadResource(res)}
                activeOpacity={0.8}>
                <Download size={14} color={colors.primary} />
                <Text style={styles.downloadButtonText}>Descargar recurso</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyBoxText}>
            Esta lección no incluye archivos descargables adicionales.
          </Text>
        </View>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabContentSection: {
      gap: 12,
    },
    tabIntroBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      marginBottom: 6,
    },
    tabIntroTextCol: {
      flex: 1,
    },
    tabIntroTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    tabIntroSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    resourceCard: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: 14,
    },
    resourceIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resourceInfoCol: {
      flex: 1,
    },
    resourceBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
    },
    resourceTypeBadge: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    resourceSizeText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    resourceTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    resourceDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 16,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      marginTop: 10,
      backgroundColor: `${colors.primary}12`,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    downloadButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary,
    },
    emptyBox: {
      padding: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    emptyBoxText: {
      fontSize: 13,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
