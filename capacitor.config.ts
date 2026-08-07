import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.kaeldev.kaeltoon',
  appName: 'Kaeltoon',
  webDir: 'dist',
  android: {
    backgroundColor: '#09090b',
    allowMixedContent: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#09090b",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashImmersive: true,
      splashFullScreen: true
    }
  }
};

export default config;
