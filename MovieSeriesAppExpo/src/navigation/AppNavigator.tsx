import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from '../screens/HomeScreen';
import { MovieDetailScreen } from '../screens/MovieDetailScreen';
import { TVDetailScreen } from '../screens/TVDetailScreen';
import { WatchedScreen } from '../screens/WatchedScreen';
import { TopRatedScreen } from '../screens/TopRatedScreen';
import { SavedScreen } from '../screens/SavedScreen';
import { Movie, TVShow } from '../types';
import { useTheme } from '../styles/ThemeContext';

export type RootStackParamList = {
  MainTabs: undefined;
  MovieDetail: { movie: Movie };
  TVDetail: { tvShow: TVShow };
};

export type TabParamList = {
  Home: undefined;
  Saved: undefined;
  Watched: undefined;
  TopRated: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 15,
          paddingTop: 15,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: theme.overlay }
            ]}>
              <Text style={[styles.icon, { color }]}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: theme.overlay }
            ]}>
              <Text style={[styles.icon, { color }]}>🕒</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Watched" 
        component={WatchedScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: theme.overlay }
            ]}>
              <Text style={[styles.icon, { color }]}>📚</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="TopRated" 
        component={TopRatedScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && { backgroundColor: theme.overlay }
            ]}>
              <Text style={[styles.icon, { color }]}>🏆</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="MainTabs"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            animationDuration: 200,
          }}
        >
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
          />
          <Stack.Screen 
            name="MovieDetail" 
            component={MovieDetailScreen}
          />
          <Stack.Screen 
            name="TVDetail" 
            component={TVDetailScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 50,
    borderRadius: 12,
  },
  icon: {
    fontSize: 28,
    textAlign: 'center',
    lineHeight: 32,
  },
});