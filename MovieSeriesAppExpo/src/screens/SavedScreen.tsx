import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { storageService } from '../services/storage';
import { tmdbApi } from '../services/tmdb';
import { Movie, TVShow, SavedItem } from '../types';
import Constants from 'expo-constants';
import { useTheme } from '../styles/ThemeContext';

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

type SavedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Saved'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SavedScreenProps = {
  navigation: SavedScreenNavigationProp;
};

export const SavedScreen: React.FC<SavedScreenProps> = ({ navigation }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    loadSaved();
    const unsubscribe = storageService.subscribeSaved(loadSaved);
    return () => unsubscribe();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    const items = await storageService.getSavedItems();
    setSavedItems(items);
    setLoading(false);
  };

  const handleRemove = async (item: SavedItem) => {
    Alert.alert(
      'Eliminar',
      `¿Seguro que quieres eliminar "${item.title}" de guardados?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await storageService.removeSavedItem(item.id, item.type);
            loadSaved();
          },
        },
      ]
    );
  };

  const handleItemPress = async (item: SavedItem) => {
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

  const renderItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri: item.posterPath
            ? `${TMDB_IMAGE_BASE_URL}${item.posterPath}`
            : 'https://via.placeholder.com/500x750?text=No+Image',
        }}
        style={styles.poster}
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.type, { color: theme.textSecondary }]}>
          {item.type === 'movie' ? 'Película' : 'Serie'}
        </Text>
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: theme.accent }]}
          onPress={(e) => {
            e.stopPropagation();
            handleRemove(item);
          }}
        >
          <Text style={styles.removeButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Guardadas para ver <Text>🕒</Text></Text>
          <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 20 }}>
              {theme.mode === 'dark' ? '☀️' : '🌑'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : savedItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🕒</Text>
          <Text style={[styles.emptyText, { color: theme.text }]}>¡Nada guardado aún!</Text>
          <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Guarda películas o series para verlas más tarde.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedItems}
          keyExtractor={(item) => `${item.id}-${item.type}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'System',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 4,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'System',
  },
  type: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'System',
    marginBottom: 8,
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'System',
  },
});