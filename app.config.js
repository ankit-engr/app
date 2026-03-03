const googleIdToScheme = (clientId) =>
  typeof clientId === 'string' && clientId.endsWith('.apps.googleusercontent.com')
    ? `com.googleusercontent.apps.${clientId.replace('.apps.googleusercontent.com', '')}`
    : null;

const googleSchemes = [
  googleIdToScheme(process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID),
  googleIdToScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
].filter(Boolean);

export default {
  expo: {
    name: 'DealRush',
    slug: 'dealrush',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/logo.png',
    scheme: ['myapp', ...googleSchemes],
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.dealrush.shopping.app',
    },
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png',
    },
    plugins: ['expo-router', 'expo-font', 'expo-web-browser'],
    experiments: {
      typedRoutes: true,
    },
    android: {
      package: "com.dealrush.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/logo.png",
        backgroundColor: "#ffffff"
      }
    },
    extra: {
      eas: {
        projectId: "8b043e0d-743e-47d8-99d1-d8cf7171037d"
      }
    }
  },
};
