import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export default function ImageGradientOverlay() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="imageGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0.42" />
            <Stop offset="45%" stopColor="#000000" stopOpacity="0.06" />
            <Stop offset="85%" stopColor="#000000" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#imageGradient)" />
      </Svg>
    </View>
  );
}
