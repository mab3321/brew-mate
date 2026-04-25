//--------------------------------------------
// SplashScreen.js
//--------------------------------------------

// Initial loading screen shown when the app starts before navigating to the main app flow.
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StatusBar,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { CatalogContext } from '../state/CatalogContext';

const { width, height } = Dimensions.get('window');

function SteamParticle({ delay, left, size, duration = 6500, bottom = 40 }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -height * 0.32,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.65,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [delay, duration, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.steam,
        {
          left,
          bottom,
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
}

function GlowBlob({ style, delay, toValue = 1.15 }) {
  const scale = useRef(new Animated.Value(0.95)).current;
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue,
            duration: 2400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 2400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 2400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 2400,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [delay, opacity, scale, toValue]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glowBlob,
        style,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
}

export default function SplashScreen({ navigation }) {
  const { hydrated } = useContext(CatalogContext);
  const [canNavigate, setCanNavigate] = useState(false);
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleMove = useRef(new Animated.Value(16)).current;
  const logoScale = useRef(new Animated.Value(0.88)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const bottomFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(titleMove, {
        toValue: 0,
        duration: 1100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.back(1.3)),
        useNativeDriver: true,
      }),
      Animated.timing(bottomFade, {
        toValue: 1,
        duration: 1300,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    ).start();

    const timer = setTimeout(() => {
      setCanNavigate(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [
    bottomFade,
    logoRotate,
    logoScale,
    navigation,
    progress,
    titleFade,
    titleMove,
  ]);

  useEffect(() => {
    if (!hydrated || !canNavigate) return;
    navigation.replace('MainTabs');
  }, [canNavigate, hydrated, navigation]);

  const rotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['18%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f1e9" />

      <View style={styles.backgroundLayer}>
        <GlowBlob style={styles.blob1} delay={0} />
        <GlowBlob style={styles.blob2} delay={600} toValue={1.08} />
        <GlowBlob style={styles.blob3} delay={1200} toValue={1.12} />
      </View>

      <View style={styles.steamLayer} pointerEvents="none">
        <SteamParticle delay={0} left={width * 0.22} size={16} />
        <SteamParticle delay={900} left={width * 0.5} size={12} />
        <SteamParticle delay={1800} left={width * 0.72} size={18} />
        <SteamParticle delay={2400} left={width * 0.35} size={10} />
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            opacity: titleFade,
            transform: [{ translateY: titleMove }],
          },
        ]}>
        <Animated.View
          style={[
            styles.logoWrap,
            {
              transform: [{ scale: logoScale }, { rotate: rotateInterpolate }],
            },
          ]}>
          <View style={styles.logoRing} />
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80',
            }}
            style={styles.logo}
          />
        </Animated.View>

        <Text style={styles.appTitle}>BrewMate</Text>
        <Text style={styles.subtitle}>Crafted coffee, anytime.</Text>

        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Fresh</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Premium</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Organic</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: bottomFade }]}>
        <Text style={styles.loadingLabel}>Brewing your experience...</Text>

        <View style={styles.progressTrack}>
          <Animated.View
            style={[styles.progressFill, { width: progressWidth }]}
          />
        </View>

        <Text style={styles.loadingHint}>Loading menu and cart...</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

//Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f1e9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  glowBlob: {
    position: 'absolute',
    backgroundColor: 'rgba(106, 78, 35, 0.12)',
    shadowColor: '#6A4E23',
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },
  blob1: {
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 70,
    left: -50,
  },
  blob2: {
    width: 240,
    height: 240,
    borderRadius: 120,
    top: height * 0.18,
    right: -70,
  },
  blob3: {
    width: 140,
    height: 140,
    borderRadius: 70,
    bottom: height * 0.16,
    left: width * 0.1,
  },
  steamLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  steam: {
    position: 'absolute',
    backgroundColor: 'rgba(106, 78, 35, 0.12)',
  },
  card: {
    width: '86%',
    maxWidth: 380,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 28,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    backdropFilter: 'blur(8px)',
  },
  logoWrap: {
    width: 154,
    height: 154,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  logoRing: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 35, 0.18)',
  },
  logo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: '#eee',
  },
  appTitle: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0.4,
    color: '#6A4E23',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: '#5f5f5f',
    textAlign: 'center',
    lineHeight: 21,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#f6f1e9',
    borderWidth: 1,
    borderColor: 'rgba(106, 78, 35, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  tagText: {
    color: '#6A4E23',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  footer: {
    position: 'absolute',
    bottom: 54,
    alignItems: 'center',
    width: '86%',
    maxWidth: 380,
  },
  loadingLabel: {
    color: '#6A4E23',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  progressTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(106, 78, 35, 0.10)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#6A4E23',
  },
  loadingHint: {
    marginTop: 10,
    color: '#777',
    fontSize: 12,
    fontWeight: '600',
  },
});
