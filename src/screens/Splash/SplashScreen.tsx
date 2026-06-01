import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Ionicons } from '@react-native-vector-icons/ionicons';
import { Colors } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(20)).current;
  const iconsOpacity = useRef(new Animated.Value(0)).current;
  const iconsTranslateY = useRef(new Animated.Value(30)).current;
  const bottomOpacity = useRef(new Animated.Value(0)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerTranslate = useRef(new Animated.Value(-width)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Logo fade in + scale up with spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),

      // 2. Gold line expand
      Animated.timing(lineWidth, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),

      // 3. Title slide up + fade in
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 4. Subtitle
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 5. Icons row
      Animated.parallel([
        Animated.timing(iconsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(iconsTranslateY, {
          toValue: 0,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),

      // 6. Bottom text
      Animated.timing(bottomOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // 7. Shimmer effect across logo
      Animated.timing(shimmerTranslate, {
        toValue: width,
        duration: 800,
        useNativeDriver: true,
      }),

      // 8. Brief pause then pulse logo
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      // 9. Hold for a moment
      Animated.delay(200),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const serviceIcons = [
    { icon: 'build-outline', label: 'Sua chua' },
    { icon: 'car-sport-outline', label: 'Xe' },
    { icon: 'shield-checkmark-outline', label: 'Bao hanh' },
    { icon: 'settings-outline', label: 'Phu tung' },
  ] as const;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.palette.navy} />
      <LinearGradient
        colors={[Colors.palette.navy, Colors.palette.cobalt, Colors.palette.navy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.decorCircle1]} />
        <View style={[styles.decorCircle, styles.decorCircle2]} />
        <View style={[styles.decorCircle, styles.decorCircle3]} />

        {/* Top accent line */}
        <Animated.View
          style={[
            styles.topAccent,
            {
              width: lineWidth.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width],
              }),
            },
          ]}
        />

        {/* Main content */}
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) },
                ],
              },
            ]}
          >
            <View style={styles.logoGlow}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Shimmer overlay */}
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)',
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0)',
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </Animated.View>

          {/* Gold divider line */}
          <Animated.View
            style={[
              styles.goldLine,
              {
                width: lineWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 120],
                }),
              },
            ]}
          />

          {/* App name */}
          <Animated.Text
            style={[
              styles.appName,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            GaraOne
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }],
              },
            ]}
          >
            
          </Animated.Text>

          {/* Service icons row */}
          <Animated.View
            style={[
              styles.iconsRow,
              {
                opacity: iconsOpacity,
                transform: [{ translateY: iconsTranslateY }],
              },
            ]}
          >
            {serviceIcons.map((item, index) => (
              <View key={index} style={styles.iconItem}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon} size={22} color="#FFFFFF" />
                </View>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Bottom */}
        <Animated.View style={[styles.bottomContainer, { opacity: bottomOpacity }]}>
          <View style={styles.bottomLine} />
          <Text style={styles.bottomText}>Powered by TN Auto</Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Decorative background circles
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  decorCircle1: {
    width: width * 1.35,
    height: width * 1.35,
    top: -width * 0.38,
    right: -width * 0.36,
  },
  decorCircle2: {
    width: width * 0.95,
    height: width * 0.95,
    bottom: -width * 0.28,
    left: -width * 0.25,
  },
  decorCircle3: {
    width: width * 0.62,
    height: width * 0.62,
    top: height * 0.12,
    left: -width * 0.16,
    borderColor: 'rgba(224,160,46,0.06)',
  },
  // Top accent
  topAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: Colors.palette.gold,
  },
  // Content
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    width: 164,
    height: 164,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoGlow: {
    width: 164,
    height: 164,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.palette.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
  },
  logo: {
    width: 148,
    height: 148,
    borderRadius: 32,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: 80,
    height: '100%',
  },
  // Gold line
  goldLine: {
    height: 3,
    backgroundColor: Colors.palette.gold,
    borderRadius: 2,
    marginBottom: 20,
  },
  // App name
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
    textShadowColor: 'rgba(224,160,46,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  // Subtitle
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 20,
  },
  // Icons row
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  iconItem: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(224,160,46,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  bottomLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(224,160,46,0.3)',
    borderRadius: 1,
    marginBottom: 12,
  },
  bottomText: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1,
  },
});

export default SplashScreen;
