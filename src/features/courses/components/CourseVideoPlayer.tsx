import React, { useState, useCallback, useRef } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  type LayoutChangeEvent,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(width, height);
const SCREEN_HEIGHT = Math.max(width, height);
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react-native';
import ImageGradientOverlay from '../../../shared/components/ImageGradientOverlay';
import Video, { OnProgressData, OnLoadData } from 'react-native-video';
import type { VideoLesson } from '../types';

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

type Props = Readonly<{
  activeLesson: VideoLesson;
  activeLessonIndex: number;
  totalLessons: number;
  isPlaying: boolean;
  playbackSpeed: number;
  currentTimeSec: number;
  showControls: boolean;
  isFullscreen: boolean;
  imageSource: any;
  onTimeUpdate: (time: number) => void;
  onToggleControls: () => void;
  onTogglePlayPause: () => void;
  onRewind: () => void;
  onForward: () => void;
  onCycleSpeed: () => void;
  onNextLesson: () => void;
  onOpenFullscreen: () => void;
  onCloseFullscreen: () => void;
  topInset: number;
}>;

export default function CourseVideoPlayer({
  activeLesson,
  activeLessonIndex,
  totalLessons,
  isPlaying,
  playbackSpeed,
  currentTimeSec,
  showControls,
  isFullscreen,
  imageSource,
  onTimeUpdate,
  onToggleControls,
  onTogglePlayPause,
  onRewind,
  onForward,
  onCycleSpeed,
  onNextLesson,
  onOpenFullscreen,
  onCloseFullscreen,
  topInset,
}: Props) {
  const videoRef = useRef<any>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playerHeight, setPlayerHeight] = useState(260);
  const [videoDuration, setVideoDuration] = useState(activeLesson.durationSec || 1);

  const progressFraction = Math.min(
    1,
    Math.max(0, currentTimeSec / videoDuration),
  );
  const progressPercent = Math.round(progressFraction * 100);

  const onContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setPlayerHeight(h);
  }, []);

  const handleProgress = useCallback((data: OnProgressData) => {
    onTimeUpdate(data.currentTime);
  }, [onTimeUpdate]);

  const handleLoad = useCallback((data: OnLoadData) => {
    setVideoDuration(data.duration);
    setVideoReady(true);
    if (currentTimeSec > 0) {
      videoRef.current?.seek(currentTimeSec);
    }
  }, [currentTimeSec]);

  const handleRewindNative = () => {
    onRewind(); // Updates parent state
    videoRef.current?.seek(Math.max(0, currentTimeSec - 10));
  };

  const handleForwardNative = () => {
    onForward(); // Updates parent state
    videoRef.current?.seek(Math.min(videoDuration, currentTimeSec + 10));
  };
  const showCoverImage = !videoReady || !isPlaying;

  return (
    <>
      {/* 
        Single Native Video Layer
        We MUST keep this mounted at all times to avoid buffering/delay when toggling fullscreen.
        The 'fullscreen' prop tells iOS to pop this exact instance into the native AVPlayerViewController.
      */}
      {activeLesson.videoUrl && (
        <View style={StyleSheet.absoluteFill} onLayout={onContainerLayout} pointerEvents={isFullscreen ? 'none' : 'auto'}>
          <Video
            ref={videoRef}
            source={{ uri: activeLesson.videoUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
            paused={!isPlaying}
            rate={playbackSpeed}
            onProgress={handleProgress}
            onLoad={handleLoad}
            progressUpdateInterval={500}
            ignoreSilentSwitch="ignore"
            muted={isMuted}
            fullscreen={isFullscreen}
            onFullscreenPlayerWillDismiss={onCloseFullscreen}
            onFullscreenPlayerDidDismiss={onCloseFullscreen}
          />
        </View>
      )}

      {!isFullscreen && (
        <>
          {!activeLesson.videoUrl && (
            <View style={[StyleSheet.absoluteFill, styles.fallbackContainer]}>
              <Text style={styles.fallbackText}>No hay video disponible</Text>
            </View>
          )}

          {/* Cover Image (hides video thumbnail until playing/ready) */}
          {showCoverImage && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Image
                source={imageSource}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <ImageGradientOverlay />
            </View>
          )}

          {/* Small Mode UI */}
          <View
            style={[
              styles.playerDimmer,
              showControls && styles.playerDimmerVisible,
            ]}
          >
            {/* Top Video Bar */}
            {showControls && (
              <View style={[styles.playerTopBar, { paddingTop: topInset + 8 }]}>
                <View style={styles.liveBadgeRow}>
                  <View
                    style={[
                      styles.liveIndicatorDot,
                      isPlaying && styles.liveIndicatorDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.liveIndicatorText,
                      isPlaying && styles.liveIndicatorTextActive,
                    ]}
                  >
                    {isPlaying ? 'EN CURSO' : 'PAUSADO'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.fullscreenBtn}
                    onPress={() => setIsMuted(prev => !prev)}
                    activeOpacity={0.7}
                  >
                    {isMuted ? (
                      <VolumeX size={20} color="#FFFFFF" />
                    ) : (
                      <Volume2 size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.fullscreenBtn}
                    onPress={onOpenFullscreen}
                    activeOpacity={0.8}
                  >
                    <Maximize2 size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Tap Area for Showing/Hiding Controls */}
            <TouchableOpacity
              activeOpacity={1}
              style={styles.tapAreaCenter}
              onPress={onToggleControls}
            >
              {/* Center Play/Pause Overlay */}
              {showControls && (
                <View style={styles.centerPlayButtonOverlay}>
                  <TouchableOpacity
                    style={styles.centerPlayButton}
                    onPress={onTogglePlayPause}
                    activeOpacity={0.8}
                  >
                    {isPlaying ? (
                      <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <Play
                        size={32}
                        color="#FFFFFF"
                        fill="#FFFFFF"
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>

            {/* Center Playback Controls */}
            {showControls && (
              <View style={styles.playerCenterControls}>
                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={handleRewindNative}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={20} color="#FFFFFF" />
                  <Text style={styles.seekLabel}>-10s</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.playPauseCenterBtn,
                    isPlaying && styles.playPauseCenterBtnPlaying,
                  ]}
                  onPress={onTogglePlayPause}
                  activeOpacity={0.8}
                >
                  {isPlaying ? (
                    <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                  ) : (
                    <Play
                      size={28}
                      color="#FFFFFF"
                      fill="#FFFFFF"
                      style={{ marginLeft: 3 }}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.seekButton}
                  onPress={handleForwardNative}
                  activeOpacity={0.7}
                >
                  <RotateCw size={20} color="#FFFFFF" />
                  <Text style={styles.seekLabel}>+10s</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Bottom Scrubber and Meta */}
            {showControls ? (
              <View style={styles.playerBottomControls}>
                <View style={styles.scrubberRow}>
                  <View style={styles.scrubberTrack}>
                    <View
                      style={[
                        styles.scrubberFill,
                        { width: `${progressPercent}%` },
                      ]}
                    />
                    <View
                      style={[
                        styles.scrubberThumb,
                        { left: `${progressPercent}%` },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.playerMetaRow}>
                  <Text style={styles.playerTimeText}>
                    {formatTime(currentTimeSec)} / {formatTime(videoDuration)}
                  </Text>

                  <View style={styles.playerBottomActionGroup}>
                    {activeLessonIndex < totalLessons - 1 && (
                      <TouchableOpacity
                        style={styles.nextLessonPill}
                        onPress={onNextLesson}
                        activeOpacity={0.7}
                      >
                        <SkipForward size={14} color="#FFFFFF" />
                        <Text style={styles.nextLessonPillText}>Siguiente</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.fullscreenBtn}
                      onPress={onOpenFullscreen}
                      activeOpacity={0.7}
                    >
                      <Maximize2 size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.miniScrubberBottom}>
                <View
                  style={[
                    styles.miniScrubberFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            )}
          </View>
        </>
      )}
    </>
  );
}


const styles = StyleSheet.create({
  fallbackContainer: {
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontSize: 14,
  },
  playerDimmer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  playerDimmerVisible: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  playerTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#94A3B8',
  },
  liveIndicatorDotActive: {
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playerTopRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  speedPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  playerCenterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  seekButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  seekLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  playPauseCenterBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  playPauseCenterBtnPlaying: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  playerBottomControls: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  scrubberRow: {
    marginBottom: 6,
  },
  scrubberTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    justifyContent: 'center',
  },
  scrubberFill: {
    height: 4,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  scrubberThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginLeft: -5,
  },
  playerMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playerTimeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  playerBottomActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextLessonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  nextLessonPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  fullscreenBtn: {
    padding: 4,
  },
  fullscreenDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  fullscreenHeaderTitleCol: {
    flex: 1,
    marginRight: 16,
  },
  fullscreenLessonNumber: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  fullscreenLessonTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  fullscreenCloseBtn: {
    padding: 8,
  },
  fullscreenCenterControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  fullscreenSeekBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  fullscreenSeekLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  fullscreenPlayPauseBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenBottomBar: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  fullscreenScrubberTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginBottom: 12,
  },
  fullscreenScrubberFill: {
    height: 6,
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  fullscreenMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullscreenTimeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fullscreenActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fullscreenSpeedPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fullscreenSpeedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fullscreenNextBtn: {
    padding: 8,
  },
  miniScrubberBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniScrubberFill: {
    height: 3,
    backgroundColor: '#2563EB',
  },
});
