import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Send, ThumbsUp } from 'lucide-react-native';
import { useTheme } from '../../../shared/context/ThemeContext';
import { ThemeColors } from '../../../shared/theme';
import type { CommentItem, VideoLesson } from '../types';

type Props = Readonly<{
  activeLesson: VideoLesson;
  activeLessonIndex: number;
  comments: CommentItem[];
  onAddComment: (content: string) => void;
  onToggleLike: (commentId: string) => void;
}>;

export default function CourseComments({
  activeLesson,
  activeLessonIndex,
  comments,
  onAddComment,
  onToggleLike,
}: Props) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [commentInput, setCommentInput] = useState('');

  const handleSend = () => {
    if (!commentInput.trim()) return;
    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  return (
    <View style={styles.tabContentSection}>
      {/* Input for new comment */}
      <View style={styles.commentInputCard}>
        <Text style={styles.commentInputHeader}>
          Preguntas de la Lección {activeLessonIndex + 1}
        </Text>
        <Text style={styles.commentInputSub} numberOfLines={1}>
          {activeLesson.title}
        </Text>

        <TextInput
          style={styles.commentTextInput}
          placeholder={`¿Tienes dudas sobre ${activeLesson.title}? Escribe aquí...`}
          placeholderTextColor={colors.textMuted}
          value={commentInput}
          onChangeText={setCommentInput}
          multiline
          numberOfLines={3}
        />

        <View style={styles.commentInputFooter}>
          <Text style={styles.commentInputHint}>
            El instructor y tus compañeros responderán a tu duda
          </Text>
          <TouchableOpacity
            style={styles.commentSendBtn}
            onPress={handleSend}
            activeOpacity={0.8}>
            <Send size={14} color="#FFFFFF" />
            <Text style={styles.commentSendBtnText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Comments Feed */}
      <View style={styles.commentsList}>
        <Text style={styles.commentsListTitle}>
          {comments.length} Consultas en esta lección
        </Text>

        {comments.map(item => (
          <View key={item.id} style={styles.commentCard}>
            <View style={styles.commentHeaderRow}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{item.avatarText}</Text>
              </View>

              <View style={styles.commentAuthorCol}>
                <View style={styles.commentNameRow}>
                  <Text style={styles.commentAuthorName}>{item.author}</Text>
                  {item.role === 'instructor' && (
                    <View style={styles.instructorPill}>
                      <Text style={styles.instructorPillText}>Instructor</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.commentTimestamp}>{item.timestamp}</Text>
              </View>

              <TouchableOpacity
                style={[styles.likeButton, item.isLiked && styles.likeButtonActive]}
                onPress={() => onToggleLike(item.id)}
                activeOpacity={0.7}>
                <ThumbsUp
                  size={13}
                  color={item.isLiked ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.likeCountText,
                    item.isLiked && styles.likeCountTextActive,
                  ]}>
                  {item.likes}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.commentContentText}>{item.content}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    tabContentSection: {
      gap: 16,
    },
    commentInputCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
    },
    commentInputHeader: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    commentInputSub: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 10,
    },
    commentTextInput: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 12,
      fontSize: 13,
      color: colors.text,
      minHeight: 70,
      textAlignVertical: 'top',
    },
    commentInputFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 12,
    },
    commentInputHint: {
      flex: 1,
      fontSize: 11,
      color: colors.textMuted,
    },
    commentSendBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    commentSendBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    commentsList: {
      gap: 10,
    },
    commentsListTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    commentCard: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
    },
    commentHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    commentAvatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    commentAvatarText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    commentAuthorCol: {
      flex: 1,
    },
    commentNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    commentAuthorName: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
    },
    instructorPill: {
      backgroundColor: `${colors.primary}18`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    instructorPillText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.primary,
    },
    commentTimestamp: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 1,
    },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      backgroundColor: colors.surfaceAlt,
    },
    likeButtonActive: {
      backgroundColor: `${colors.primary}18`,
    },
    likeCountText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '600',
    },
    likeCountTextActive: {
      color: colors.primary,
    },
    commentContentText: {
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
  });
