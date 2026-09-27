import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowRight, Award, BookOpen, Check, Terminal } from 'lucide-react-native';
import { colors, radius, spacing } from '../../../shared/theme';

type Props = Readonly<{
  onDone: () => void;
}>;

type Slide = Readonly<{
  key: string;
  icon: React.ReactNode;
  badgeBg: string;
  title: string;
  description: string;
}>;

const SLIDES: readonly Slide[] = [
  {
    key: 'learn',
    icon: <BookOpen size={52} color={colors.primary} strokeWidth={2} />,
    badgeBg: `${colors.primary}18`,
    title: 'Cursos prácticos para DevOps',
    description:
      'Aprende Docker, Kubernetes, CI/CD, Terraform y AWS con lecciones interactivas y proyectos reales.',
  },
  {
    key: 'labs',
    icon: <Terminal size={52} color={colors.accent} strokeWidth={2} />,
    badgeBg: `${colors.accent}18`,
    title: 'Laboratorios guiados paso a paso',
    description:
      'Domina comandos de terminal y configuración de pipelines guiados por ingenieros DevOps expertos.',
  },
  {
    key: 'certify',
    icon: <Award size={52} color="#A78BFA" strokeWidth={2} />,
    badgeBg: '#A78BFA18',
    title: 'Certifícate e impulsa tu carrera',
    description:
      'Completa cursos, supera retos técnicos y obtén certificaciones verificadas para tu perfil profesional.',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OnboardingScreen({ onDone }: Readonly<Props>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / SCREEN_WIDTH,
    );
    setActiveIndex(index);
  };

  const handleNext = () => {
    if (isLastSlide) {
      onDone();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onDone}>
        <Text style={styles.skipText}>Saltar</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconBadge, { backgroundColor: item.badgeBg }]}>
              {item.icon}
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => {
            const inputRange = [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH,
            ];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.85}
          onPress={handleNext}>
          <Text style={styles.primaryButtonText}>
            {isLastSlide ? 'Comenzar' : 'Siguiente'}
          </Text>
          {isLastSlide ? (
            <Check size={18} color={colors.textOnPrimary} strokeWidth={2.5} />
          ) : (
            <ArrowRight size={18} color={colors.textOnPrimary} strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.lg,
    zIndex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconBadge: {
    width: 120,
    height: 120,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 48,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
});
