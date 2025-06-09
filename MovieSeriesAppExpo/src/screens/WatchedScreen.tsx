import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { storageService } from '../services/storage';
import { tmdbApi } from '../services/tmdb';
import { WatchedItem, Movie, TVShow } from '../types';
import Constants from 'expo-constants';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../styles/ThemeContext';

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

type WatchedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Watched'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type WatchedScreenProps = {
  navigation: WatchedScreenNavigationProp;
};

export const WatchedScreen: React.FC<WatchedScreenProps> = ({ navigation }) => {
  const [watchedItems, setWatchedItems] = useState<WatchedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<WatchedItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'title'>('date');
  const scaleAnim = new Animated.Value(1);

  const { theme, toggleTheme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      loadWatchedItems();
    }, [])
  );

  const loadWatchedItems = async () => {
    setLoading(true);
    try {
      const items = await storageService.getWatchedItems();
      setWatchedItems(items);
      applyFilterAndSort(items, filter, sortBy);
    } catch (error) {
      console.error('WatchedScreen: Error loading watched items:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilterAndSort = (items: WatchedItem[], currentFilter: typeof filter, currentSort: typeof sortBy) => {
    let filtered = items;

    if (currentFilter !== 'all') {
      filtered = items.filter(item => item.type === currentFilter);
    }

    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          return new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime();
      }
    });

    setFilteredItems(filtered);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    applyFilterAndSort(watchedItems, newFilter, sortBy);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    applyFilterAndSort(watchedItems, filter, newSort);
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

  const handleItemPress = async (item: WatchedItem) => {
    try {
      if (item.type === 'movie') {
        const movieData = await tmdbApi.getMovieDetails(item.id);
        const movie: Movie = {
          id: movieData.id,
          title: movieData.title,
          poster_path: movieData.poster_path,
          backdrop_path: movieData.backdrop_path,
          overview: movieData.overview,
          release_date: movieData.release_date,
          vote_average: movieData.vote_average,
          vote_count: movieData.vote_count,
          adult: movieData.adult,
          genre_ids: movieData.genres?.map(g => g.id) || [],
          original_language: movieData.original_language,
          original_title: movieData.original_title,
          popularity: movieData.popularity,
          video: movieData.video || false
        };
        navigation.navigate('MovieDetail', { movie });
      } else {
        const tvData = await tmdbApi.getTVDetails(item.id);
        const tvShow: TVShow = {
          id: tvData.id,
          name: tvData.name,
          poster_path: tvData.poster_path,
          backdrop_path: tvData.backdrop_path,
          overview: tvData.overview,
          first_air_date: tvData.first_air_date,
          vote_average: tvData.vote_average,
          vote_count: tvData.vote_count,
          genre_ids: tvData.genres?.map(g => g.id) || [],
          origin_country: tvData.origin_country,
          original_language: tvData.original_language,
          original_name: tvData.original_name,
          popularity: tvData.popularity,
          adult: tvData.adult || false
        };
        navigation.navigate('TVDetail', { tvShow });
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      Alert.alert('Error', 'No se pudieron cargar los detalles. Inténtalo de nuevo.');
    }
  };

  const renderWatchedItem = ({ item }: { item: WatchedItem }) => (
    <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => handleItemPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.posterPath
                ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}`
                : 'https://via.placeholder.com/500x750?text=No+Image',
            }}
            style={styles.poster}
          />
          <View style={styles.overlay}>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingBadgeText}>★ {item.rating}/10</Text>
            </View>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.metadata}>
            <Text style={[
              styles.type,
              item.type === 'movie' ? { color: theme.accent } : { color: theme.accentSecondary }
            ]}>
              {item.type === 'movie' ? '🎬 Película' : '📺 Serie'}
            </Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {new Date(item.watchedDate).toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit' 
              })}
            </Text>
          </View>
          {item.review && (
            <Text style={[styles.review, { color: theme.textSecondary }]} numberOfLines={2}>
              "{item.review}"
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1} adjustsFontSizeToFit>
              Mi Cinemateca 🎬
            </Text>
          </View>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
            <Text style={styles.themeIcon}>
              {theme.mode === 'dark' ? '☀️' : '🌑'}
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{filteredItems.length} elementos</Text>
      </View>

      {/* Filtros */}
      <View style={[styles.filtersSection, { backgroundColor: theme.card }]}>
        <View style={[styles.filterRow, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && { backgroundColor: theme.accent }]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && { color: theme.text }]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'movie' && { backgroundColor: theme.accent }]}
            onPress={() => handleFilterChange('movie')}
          >
            <Text style={[styles.filterText, filter === 'movie' && { color: theme.text }]}>
              Películas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'tv' && { backgroundColor: theme.accent }]}
            onPress={() => handleFilterChange('tv')}
          >
            <Text style={[styles.filterText, filter === 'tv' && { color: theme.text }]}>
              Series
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ordenamiento */}
        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: theme.text }]}>Ordenar por:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'date' && { backgroundColor: theme.accentSecondary }]}
            onPress={() => handleSortChange('date')}
          >
            <Text style={[styles.sortText, sortBy === 'date' && { color: theme.background }]}>
              Fecha
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'rating' && { backgroundColor: theme.accentSecondary }]}
            onPress={() => handleSortChange('rating')}
          >
            <Text style={[styles.sortText, sortBy === 'rating' && { color: theme.background }]}>
              Calificación
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'title' && { backgroundColor: theme.accentSecondary }]}
            onPress={() => handleSortChange('title')}
          >
            <Text style={[styles.sortText, sortBy === 'title' && { color: theme.background }]}>
              Título
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎭</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>No has visto nada aún</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Explora y marca tus películas y series favoritas
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.id}-${item.type}`}
          renderItem={renderWatchedItem}
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
  header: {
    padding: 20,
    paddingTop: 32,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  themeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  themeIcon: {
    fontSize: 24,
    color: '#999999',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'System',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  filtersSection: {
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    borderRadius: 25,
    padding: 4,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  filterText: {
    fontWeight: '500',
    fontSize: 14,
    fontFamily: 'System',
    color: '#999999',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortLabel: {
    fontSize: 14,
    marginRight: 12,
    fontFamily: 'System',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 4,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
    color: '#999999',
  },
  listContainer: {
    padding: 16,
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
    top: 8,
    right: 8,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: '#FFB74D',
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
    marginBottom: 6,
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
  },
  date: {
    fontSize: 12,
    fontFamily: 'System',
  },
  review: {
    fontSize: 12,
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
    fontFamily: 'System',
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
});