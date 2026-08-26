import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { AppText } from '../../../components/ui/AppText';
import {
  colors,
  radius,
  screenPaddingHorizontal,
  sectionGap,
  shadows,
  spacing,
} from '../../../design-system';

export interface HomePromoSlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface HomePromoCarouselProps {
  slides: HomePromoSlide[];
  onPress?: (slide: HomePromoSlide) => void;
}

const AUTOPLAY_INTERVAL_MS = 5000;

export function HomePromoCarousel({ slides, onPress }: HomePromoCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const activeIndexRef = useRef(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const slideWidth = screenWidth - screenPaddingHorizontal * 2;
  const [activeIndex, setActiveIndex] = useState(0);
  const visibleSlides = useMemo(() => slides.filter(Boolean).slice(0, 3), [slides]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  const scrollToSlide = useCallback(
    (index: number, animated = true) => {
      if (visibleSlides.length === 0) {
        return;
      }

      const clampedIndex = Math.min(Math.max(index, 0), visibleSlides.length - 1);
      activeIndexRef.current = clampedIndex;
      setActiveIndex(clampedIndex);
      scrollRef.current?.scrollTo({ x: clampedIndex * slideWidth, animated });
    },
    [slideWidth, visibleSlides.length],
  );

  const startAutoplay = useCallback(() => {
    stopAutoplay();

    if (visibleSlides.length <= 1) {
      return;
    }

    autoplayRef.current = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % visibleSlides.length;
      scrollToSlide(nextIndex);
    }, AUTOPLAY_INTERVAL_MS);
  }, [scrollToSlide, stopAutoplay, visibleSlides.length]);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
    startAutoplay();

    return stopAutoplay;
  }, [visibleSlides, startAutoplay, stopAutoplay]);

  if (visibleSlides.length === 0) {
    return null;
  }

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    startAutoplay();
  };

  const handleManualInteraction = () => {
    stopAutoplay();
  };

  return (
    <View
      style={styles.wrapper}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={(_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
      }
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        bounces={visibleSlides.length > 1}
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        decelerationRate="fast"
        onScrollBeginDrag={handleManualInteraction}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={[styles.carousel, { width: slideWidth }]}
        contentContainerStyle={styles.carouselContent}
      >
        {visibleSlides.map((slide) => (
          <Pressable
            key={slide.id}
            accessibilityRole="button"
            accessibilityLabel={slide.title}
            onPress={() => onPress?.(slide)}
            style={({ pressed }) => [
              styles.banner,
              { width: slideWidth },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.accentOrb} />
            <View style={styles.content}>
              <AppText variant="h3" style={styles.title}>
                {slide.title}
              </AppText>
              {slide.subtitle ? (
                <AppText variant="bodySmall" color="textMuted">
                  {slide.subtitle}
                </AppText>
              ) : null}
            </View>
            {slide.imageUrl ? (
              <Image source={{ uri: slide.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
            ) : (
              <View style={styles.bannerImagePlaceholder} />
            )}
          </Pressable>
        ))}
      </ScrollView>

      {visibleSlides.length > 1 ? (
        <View style={styles.dots}>
          {visibleSlides.map((slide, index) => (
            <Pressable
              key={slide.id}
              accessibilityRole="button"
              accessibilityLabel={`Show promotion ${index + 1}`}
              onPress={() => {
                scrollToSlide(index);
                startAutoplay();
              }}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: screenPaddingHorizontal,
    marginTop: spacing.lg,
    marginBottom: sectionGap - spacing.md,
    gap: spacing.md,
  },
  carousel: {
    overflow: 'visible',
  },
  carouselContent: {
    alignItems: 'stretch',
  },
  banner: {
    minHeight: 148,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.card,
  },
  pressed: {
    opacity: 0.96,
  },
  accentOrb: {
    position: 'absolute',
    left: -28,
    top: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primarySoft,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
    zIndex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  bannerImage: {
    width: 132,
    height: '100%',
    minHeight: 148,
  },
  bannerImagePlaceholder: {
    width: 132,
    minHeight: 148,
    backgroundColor: colors.disabledBg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
});
