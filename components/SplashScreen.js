import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Line, Defs, LinearGradient, Stop, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const [contentLoaded, setContentLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const pathLeftAnim = useRef(new Animated.Value(60)).current;
  const pathRightAnim = useRef(new Animated.Value(60)).current;
  const personScaleAnim = useRef(new Animated.Value(0.5)).current;
  const personOpacityAnim = useRef(new Animated.Value(0)).current;
  const arrowOpacityAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(8)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const exitOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    
    const contentTimer = setTimeout(() => setContentLoaded(true), 100);

    Animated.sequence([
      
      Animated.parallel([
        Animated.timing(logoScaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        Animated.timing(pathLeftAnim, {
          toValue: 0,
          duration: 1000,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pathRightAnim, {
          toValue: 0,
          duration: 1000,
          delay: 450,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.parallel([
        Animated.timing(personScaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(personOpacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      
      Animated.timing(arrowOpacityAnim, {
        toValue: 1,
        duration: 400,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotsAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(dotsAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const exitTimer = setTimeout(() => {
      Animated.timing(exitOpacityAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2800);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(exitTimer);
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: exitOpacityAnim,
        }
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" />

      {}
      <View style={styles.ambientLayer}>
        <View style={[styles.glow, styles.glowPrimary]} />
        <View style={[styles.glow, styles.glowSecondary]} />
      </View>

      {}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: Animated.multiply(scaleAnim, -12).interpolate({
                inputRange: [0, 1],
                outputRange: [12, 0]
              })},
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacityAnim,
              transform: [{ scale: logoScaleAnim }]
            }
          ]}
        >
          {}
          <View style={styles.logoRing} />

          {}
          <Svg width={140} height={140} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                <Stop offset="100%" stopColor="#1D4ED8" stopOpacity="0.1" />
              </LinearGradient>
            </Defs>

            <G transform="translate(0, -4)">
              {}
              <AnimatedPath
                d="M 50 85 Q 50 62 33 38"
                stroke="white"
                strokeWidth="5.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                strokeDashoffset={pathLeftAnim}
              />

              {}
              <AnimatedPath
                d="M 50 85 Q 50 62 67 38"
                stroke="white"
                strokeWidth="5.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="60"
                strokeDashoffset={pathRightAnim}
              />

              {}
              <AnimatedG opacity={personOpacityAnim} scale={personScaleAnim}>
                <Circle cx="50" cy="78" r="4" fill="white" />
                <Line x1="50" y1="82" x2="50" y2="88" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              </AnimatedG>

              {}
              <AnimatedG opacity={arrowOpacityAnim}>
                <Path d="M 32 38 L 35 40 L 32 42" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <Path d="M 68 38 L 65 40 L 68 42" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </AnimatedG>
            </G>
          </Svg>
        </Animated.View>

        {}
        <Animated.View
          style={[
            styles.brandWrapper,
            {
              opacity: textOpacityAnim,
              transform: [{ translateY: textSlideAnim }]
            }
          ]}
        >
          <Text style={styles.brandTitle}>Vayze</Text>
          <Text style={styles.brandTagline}>Entscheidungen. Durchdacht.</Text>
        </Animated.View>

        {}
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: dotsAnim.interpolate({
                    inputRange: [0, 0.3 + i * 0.15, 0.6, 1],
                    outputRange: [0.6, 1, 0.6, 0.6]
                  }),
                  transform: [{
                    translateY: dotsAnim.interpolate({
                      inputRange: [0, 0.3 + i * 0.15, 0.6, 1],
                      outputRange: [0, -10, 0, 0]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>

        {}
        <Animated.Text style={[styles.versionBadge, { opacity: textOpacityAnim }]}>
          v1.0.0
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedG = Animated.createAnimatedComponent(G);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  ambientLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.3,
  },
  glowPrimary: {
    top: height * 0.15,
    left: width * 0.2,
    width: 400,
    height: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  glowSecondary: {
    bottom: height * 0.2,
    right: width * 0.15,
    width: 350,
    height: 350,
    backgroundColor: 'rgba(96, 165, 250, 0.12)',
  },
  contentWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  logoContainer: {
    width: 140,
    height: 140,
    marginBottom: 40,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRing: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  brandWrapper: {
    alignItems: 'center',
    marginBottom: 48,
  },
  brandTitle: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: 'white',
    marginBottom: 8,
  },
  brandTagline: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.2,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 3,
  },
  versionBadge: {
    position: 'absolute',
    bottom: -100,
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 1,
  },
});
