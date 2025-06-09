import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { storageService } from './src/services/storage';
import { ThemeProvider, useTheme } from './src/styles/ThemeContext';

function MainApp() {
  const { theme } = useTheme();
  return (
    <>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} backgroundColor={theme.background} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await storageService.initDB();
        console.log('Storage inicializado correctamente');
      } catch (error) {
        console.error('Error inicializando el storage:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <MainApp />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}