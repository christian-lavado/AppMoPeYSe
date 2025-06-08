import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { WatchedItem } from '../types';
import { storageService as databaseService } from '../services/storage';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

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

  console.log('WatchedScreen: Component rendered');

  useFocusEffect(
    useCallback(() => {
      console.log('WatchedScreen: useFocusEffect triggered');
      loadWatchedItems();
    }, [])
  );

  const loadWatchedItems = async () => {
    console.log('WatchedScreen: loadWatchedItems started');
    setLoading(true);
    try {
      await databaseService.initDB();
      console.log('WatchedScreen: Database initialized');
      
      const items = await databaseService.getWatchedItems();
      console.log('WatchedScreen: Items loaded:', items.length);
      
      setWatchedItems(items);
      applyFilterAndSort(items, filter, sortBy);
    } catch (error) {
      console.error('WatchedScreen: Error loading items:', error);
      Alert.alert('Error', 'No se pudieron cargar las películas/series vistas');
    } finally {
      setLoading(false);
      console.log('WatchedScreen: Loading finished');
    }
  };

  const applyFilterAndSort = (items: WatchedItem[], currentFilter: typeof filter, currentSort: typeof sortBy) => {
    console.log('WatchedScreen: Applying filter and sort', { currentFilter, currentSort, itemsCount: items.length });
    
    let filtered = items;

    // Aplicar filtro
    if (currentFilter !== 'all') {
      filtered = items.filter(item => item.type === currentFilter);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (currentSort) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rating':
          return b.user_rating - a.user_rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    console.log('WatchedScreen: Filtered items:', filtered.length);
    setFilteredItems(filtered);
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    console.log('WatchedScreen: Filter changed to:', newFilter);
    setFilter(newFilter);
    applyFilterAndSort(watchedItems, newFilter, sortBy);
  };

  const handleSortChange = (newSort: typeof sortBy) => {
    console.log('WatchedScreen: Sort changed to:', newSort);
    setSortBy(newSort);
    applyFilterAndSort(watchedItems, filter, newSort);
  };

  const renderWatchedItem = ({ item }: { item: WatchedItem }) => (
    <TouchableOpacity style={styles.itemContainer}>
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
        <Text style={styles.type}>
          {item.type === 'movie' ? 'Película' : 'Serie'}
        </Text>
        <Text style={styles.rating}>
          Mi puntuación: ⭐ {item.user_rating}/10
        </Text>
        <Text style={styles.date}>
          Visto: {new Date(item.watched_date).toLocaleDateString()}
        </Text>
        {item.user_review && (
          <Text style={styles.review} numberOfLines={2}>
            "{item.user_review}"
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  console.log('WatchedScreen: Rendering with state:', { 
    loading, 
    watchedItemsCount: watchedItems.length, 
    filteredItemsCount: filteredItems.length,
    filter,
    sortBy 
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Películas y Series Vistas</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => handleFilterChange('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            Todas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'movie' && styles.activeFilter]}
          onPress={() => handleFilterChange('movie')}
        >
          <Text style={[styles.filterText, filter === 'movie' && styles.activeFilterText]}>
            Películas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'tv' && styles.activeFilter]}
          onPress={() => handleFilterChange('tv')}
        >
          <Text style={[styles.filterText, filter === 'tv' && styles.activeFilterText]}>
            Series
          </Text>
        </TouchableOpacity>
      </View>

      {filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {watchedItems.length === 0 
              ? 'No tienes películas o series marcadas como vistas'
              : `No hay ${filter === 'movie' ? 'películas' : filter === 'tv' ? 'series' : 'elementos'} en esta categoría`
            }
          </Text>
          <Text style={styles.emptySubtext}>
            Ve a buscar contenido y márcalo como visto para verlo aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderWatchedItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadWatchedItems}
              colors={['#0066cc']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    padding: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#0066cc',
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 0,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  type: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  rating: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  review: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});