import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.kaeldev.kaeltoon',
  appName: 'Kaeltoon',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    backgroundColor: '#09090b',
    allowMixedContent: true
  }
};

export default config;
