import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { storageService } from './src/services/storage';

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
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#0066cc" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}