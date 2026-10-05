import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { radius, spacing, ThemeColors } from '../../../shared/theme';

interface CourseReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  courseTitle: string;
}

export default function CourseReviewModal({
  visible,
  onClose,
  onSubmit,
  courseTitle,
}: CourseReviewModalProps) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
    setRating(0);
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.title}>¡Felicidades por terminar el curso!</Text>
          <Text style={styles.subtitle}>
            ¿Qué te pareció "{courseTitle}"?
          </Text>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
              >
                <Star
                  size={40}
                  color={star <= rating ? '#FFD700' : colors.border}
                  fill={star <= rating ? '#FFD700' : 'transparent'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Deja un comentario sobre el curso..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              rating === 0 && styles.submitBtnDisabled,
            ]}
            disabled={rating === 0}
            onPress={handleSubmit}
          >
            <Text style={styles.submitBtnText}>Enviar valoración</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: colors.surface,
      width: '100%',
      borderRadius: radius.lg,
      padding: spacing.xl,
      alignItems: 'center',
      position: 'relative',
    },
    closeBtn: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      padding: spacing.sm,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: spacing.sm,
      marginTop: spacing.md,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    starsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: spacing.xl,
    },
    starBtn: {
      padding: spacing.xs,
    },
    input: {
      width: '100%',
      backgroundColor: colors.background,
      borderRadius: radius.md,
      padding: spacing.md,
      color: colors.text,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    submitBtn: {
      backgroundColor: colors.primary,
      width: '100%',
      padding: spacing.md,
      borderRadius: radius.full,
      alignItems: 'center',
    },
    submitBtnDisabled: {
      backgroundColor: colors.border,
    },
    submitBtnText: {
      color: '#FFFFFF',
      fontWeight: 'bold',
      fontSize: 16,
    },
  });
