import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radius } from '../theme';

type Props = Readonly<{
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
}>;

function ProgressBar({
  progress,
  color,
  trackColor,
  height = 8,
}: Readonly<Props>) {
  const { colors } = useTheme();
  const fillColor = color ?? colors.primary;
  const barTrackColor = trackColor ?? colors.surfaceAlt;
  const width = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(width, {
      toValue: clamped,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [clamped, width]);

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: barTrackColor },
      ]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: fillColor,
            width: width.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: radius.full,
  },
  fill: {
    borderRadius: radius.full,
  },
});

export default ProgressBar;
