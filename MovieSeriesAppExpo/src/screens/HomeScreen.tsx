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
  Animated,
} from 'react-native';
import { tmdbApi } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import Constants from 'expo-constants';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../styles/ThemeContext';
import Logo from '../../assets/logo.png';

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
  const [searchFocused, setSearchFocused] = useState(false);
  const scaleAnim = new Animated.Value(1);

  const { theme, toggleTheme } = useTheme();

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

  const clearSearch = () => {
    setSearchQuery('');
    loadPopularContent();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('MovieDetail', { movie: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image',
            }}
            style={styles.poster}
          />
          <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
            <Text style={[styles.overlayTitle, { color: theme.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <TouchableOpacity style={[styles.detailsButton, { backgroundColor: theme.accent }]}>
              <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metadata}>
            <Text style={[styles.year, { color: theme.textSecondary }]}>{item.release_date?.split('-')[0] || 'N/A'}</Text>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {item.vote_average.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTVItem = ({ item }: { item: TVShow }) => (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('TVDetail', { tvShow: item })}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.poster_path
                ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Image',
            }}
            style={styles.poster}
          />
          <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
            <Text style={[styles.overlayTitle, { color: theme.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <TouchableOpacity style={[styles.detailsButton, { backgroundColor: theme.accent }]}>
              <Text style={styles.detailsButtonText}>Ver Detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.metadata}>
            <Text style={[styles.year, { color: theme.textSecondary }]}>{item.first_air_date?.split('-')[0] || 'N/A'}</Text>
            <View style={styles.rating}>
              <Text style={styles.ratingText}>⭐ {item.vote_average.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header con navbar fija */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Image source={Logo} style={styles.logo} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Your Fi&amp;Se</Text>
          <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 20 }}>
              {theme.mode === 'dark' ? '☀️' : '🌑'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de búsqueda */}
      <View style={[styles.searchSection, { backgroundColor: theme.card }]}>
        <View style={[
          styles.searchContainer,
          { backgroundColor: theme.overlay, borderColor: searchFocused ? theme.accent : 'transparent' }
        ]}>
          <TouchableOpacity onPress={searchContent} style={styles.searchButton}>
            <Text style={[styles.searchIcon, { color: theme.textSecondary }]}>🔍</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Busca tu serie o película..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchContent}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={[styles.clearIcon, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pestañas de filtro */}
      <View style={[styles.tabSection, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'movies' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('movies')}
        >
          <Text style={[styles.tabText, activeTab === 'movies' && { color: theme.text } ]}>
            Películas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tv' && { backgroundColor: theme.accent }]}
          onPress={() => setActiveTab('tv')}
        >
          <Text style={[styles.tabText, activeTab === 'tv' && { color: theme.text } ]}>
            Series
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido principal */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'movies' ? movies : tvShows}
          keyExtractor={(item) => item.id.toString()}
          renderItem={activeTab === 'movies' ? renderMovieItem : renderTVItem}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'System',
    flex: 1,
  },
  searchSection: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
  },
  searchButton: {
    padding: 4,
    marginRight: 8,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
  },
  tabSection: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabText: {
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'System',
    color: '#999999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 20,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  poster: {
    width: '100%',
    aspectRatio: 2 / 3,
    resizeMode: 'cover',
    borderRadius: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    padding: 12,
  },
  overlayTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  year: {
    fontSize: 14,
    fontFamily: 'System',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#FFB74D',
    fontWeight: '500',
    fontFamily: 'System',
  },
});