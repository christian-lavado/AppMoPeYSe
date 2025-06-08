import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { tmdbApi } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import Constants from 'expo-constants';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv'>('movies');

  useEffect(() => {
    loadPopularContent();
  }, [activeTab]);

  const loadPopularContent = async () => {
    setLoading(true);
    try {
      if (activeTab === 'movies') {
        const response = await tmdbApi.getPopularMovies();
        setMovies(response.results);
      } else {
        const response = await tmdbApi.getPopularTVShows();
        setTVShows(response.results);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el contenido');
    } finally {
      setLoading(false);
    }
  };

  const searchContent = async () => {
    if (!searchQuery.trim()) {
      loadPopularContent();
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'movies') {
        const response = await tmdbApi.searchMovies(searchQuery);
        setMovies(response.results);
      } else {
        const response = await tmdbApi.searchTVShows(searchQuery);
        setTVShows(response.results);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('MovieDetail', { movie: item })}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image',
        }}
        style={styles.poster}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.releaseDate}>{item.release_date}</Text>
        <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderTVItem = ({ item }: { item: TVShow }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('TVDetail', { tvShow: item })}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image',
        }}
        style={styles.poster}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.title} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.releaseDate}>{item.first_air_date}</Text>
        <Text style={styles.rating}>⭐ {item.vote_average.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AppMoPeYSe</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar películas o series..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchContent}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchContent}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
          onPress={() => setActiveTab('movies')}
        >
          <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
            Películas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tv' && styles.activeTab]}
          onPress={() => setActiveTab('tv')}
        >
          <Text style={[styles.tabText, activeTab === 'tv' && styles.activeTabText]}>
            Series
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" style={styles.loading} />
      ) : (
        <FlatList
          data={activeTab === 'movies' ? movies : tvShows}
          keyExtractor={(item) => item.id.toString()}
          renderItem={activeTab === 'movies' ? renderMovieItem : renderTVItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#0066cc',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#0066cc',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  activeTab: {
    backgroundColor: '#0066cc',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 0,
  },
  itemContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  poster: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemInfo: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
});