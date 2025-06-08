import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { TVDetailScreen } from '../screens/TVDetailScreen';
import { WatchedScreen } from '../screens/WatchedScreen';
import { Movie, TVShow } from '../types';

export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetail: { movie: Movie };
  TVDetail: { tvShow: TVShow };
};

export type TabParamList = {
  Home: undefined;
  Watched: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 5,
      },
    }}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{
        title: 'Inicio',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color, marginBottom: 2 }}>🏠</Text>
        ),
      }}
    />
    <Tab.Screen 
      name="Watched" 
      component={WatchedScreen}
      options={{
        title: 'Vistas',
        tabBarIcon: ({ color }) => (
          <Text style={{ fontSize: 22, color, marginBottom: 2 }}>👁️</Text>
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  return (
    <SafeAreaView edges={['top','bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
          />
          <Stack.Screen 
            name="MovieDetail" 
            component={MovieDetailScreen}
            options={{
              headerShown: true,
              title: 'Detalles de Película',
              headerStyle: {
                backgroundColor: '#0066cc',
              },
              headerTintColor: 'white',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen 
            name="TVDetail" 
            component={TVDetailScreen}
            options={{
              headerShown: true,
              title: 'Detalles de Serie',
              headerStyle: {
                backgroundColor: '#0066cc',
              },
              headerTintColor: 'white',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};