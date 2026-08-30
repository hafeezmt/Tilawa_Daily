import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tilawadaily.app',
  appName: 'Tilawa Daily',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#020617",
      showSpinner: false
    }
  }
};

export default config;
