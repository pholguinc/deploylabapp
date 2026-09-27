import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Loader from '../../../shared/components/Loader';
import { colors, spacing } from '../../../shared/theme';

type Props = {
  onFinish: () => void;
};

const APP_NAME = 'DeployLab';
const APP_TAGLINE = 'Aprende DevOps desde cero hasta producción';
const APP_VERSION = 'v0.0.1';

export default function SplashScreen({ onFinish }: Props) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslate = useRef(new Animated.Value(12)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslate, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseAnimation.start();

    const timer = setTimeout(onFinish, 2600);

    return () => {
      pulseAnimation.stop();
      clearTimeout(timer);
    };
  }, [logoOpacity, logoScale, contentOpacity, contentTranslate, pulse, onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ scale: Animated.multiply(logoScale, pulse) }],
            },
          ]}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoGlyph}>D</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentTranslate }],
            },
          ]}>
          <Text style={styles.appName}>{APP_NAME}</Text>
          <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <Loader size={36} strokeWidth={3} />
        <Text style={styles.loadingText}>Preparando todo…</Text>
        <Text style={styles.version}>{APP_VERSION}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    marginBottom: spacing.lg,
  },
  textBlock: {
    alignItems: 'center',
  },
  logoBadge: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  logoGlyph: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.textOnPrimary,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: spacing.xs,
    fontSize: 14,
    color: colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 13,
    color: colors.textMuted,
  },
  version: {
    marginTop: spacing.xs,
    fontSize: 11,
    color: colors.textMuted,
  },
});
