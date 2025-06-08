import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Movie, WatchedItem } from '../types';
import { RootStackParamList } from '../navigation/AppNavigator';
import Constants from 'expo-constants';
import { storageService as databaseService } from '../services/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

type MovieDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({ route, navigation }) => {
  const { movie } = route.params;
  const [isWatched, setIsWatched] = useState(false);
  const [watchedItem, setWatchedItem] = useState<WatchedItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  useEffect(() => {
    checkIfWatched();
  }, []);

  const checkIfWatched = async () => {
    try {
      const item = await databaseService.getWatchedItem(movie.id, 'movie');
      if (item) {
        setIsWatched(true);
        setWatchedItem(item);
        setRating(item.user_rating);
        setReview(item.user_review);
      }
    } catch (error) {
      console.log('Error checking watched status:', error);
    }
  };

  const handleMarkAsWatched = () => {
    setModalVisible(true);
  };

  const saveWatchedMovie = async () => {
    try {
      const watchedData = {
        tmdb_id: movie.id,
        title: movie.title,
        type: 'movie' as const,
        poster_path: movie.poster_path,
        user_rating: rating,
        user_review: review,
        watched_date: new Date().toISOString().split('T')[0],
      };

      if (isWatched && watchedItem) {
        await databaseService.updateWatchedItem(watchedItem.id, watchedData);
      } else {
        await databaseService.addWatchedItem(watchedData);
      }

      setIsWatched(true);
      setModalVisible(false);
      Alert.alert('Éxito', 'Película guardada correctamente');
      checkIfWatched();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la película');
    }
  };

  const removeFromWatched = async () => {
    if (!watchedItem) return;

    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar esta película de tu lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteWatchedItem(watchedItem.id);
              setIsWatched(false);
              setWatchedItem(null);
              Alert.alert('Éxito', 'Película eliminada de tu lista');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la película');
            }
          },
        },
      ]
    );
  };

  const renderStars = (currentRating: number, onPress?: (rating: number) => void) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Text style={[styles.star, { color: star <= currentRating ? '#FFD700' : '#ccc' }]}>
              ⭐
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['left', 'right']}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <Image
          source={{
            uri: movie.backdrop_path
              ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`
              : `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`,
          }}
          style={styles.backdrop}
        />

        <View style={styles.content}>
          <View style={styles.movieInfo}>
            <Image
              source={{
                uri: movie.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Image',
              }}
              style={styles.poster}
            />
            <View style={styles.details}>
              <Text style={styles.title}>{movie.title}</Text>
              <Text style={styles.releaseDate}>Estreno: {movie.release_date}</Text>
              <Text style={styles.rating}>⭐ {movie.vote_average.toFixed(1)}/10</Text>
              <Text style={styles.voteCount}>({movie.vote_count} votos)</Text>
            </View>
          </View>

          <Text style={styles.overview}>{movie.overview}</Text>

          {isWatched && watchedItem && (
            <View style={styles.watchedInfo}>
              <Text style={styles.watchedTitle}>Tu valoración:</Text>
              {renderStars(watchedItem.user_rating)}
              <Text style={styles.userRating}>{watchedItem.user_rating}/10</Text>
              {watchedItem.user_review && (
                <>
                  <Text style={styles.reviewTitle}>Tu reseña:</Text>
                  <Text style={styles.userReview}>{watchedItem.user_review}</Text>
                </>
              )}
              <Text style={styles.watchedDate}>
                Visto el: {new Date(watchedItem.watched_date).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            {isWatched ? (
              <>
                <TouchableOpacity style={styles.editButton} onPress={handleMarkAsWatched}>
                  <Text style={styles.buttonText}>Editar valoración</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removeButton} onPress={removeFromWatched}>
                  <Text style={styles.buttonText}>Eliminar de lista</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.watchedButton} onPress={handleMarkAsWatched}>
                <Text style={styles.buttonText}>Marcar como vista</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isWatched ? 'Editar valoración' : 'Marcar como vista'}
              </Text>

              <Text style={styles.ratingLabel}>Puntuación (1-10):</Text>
              {renderStars(rating, setRating)}

              <Text style={styles.reviewLabel}>Reseña (opcional):</Text>
              <TextInput
                style={styles.reviewInput}
                value={review}
                onChangeText={setReview}
                placeholder="Escribe tu opinión sobre la película..."
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={saveWatchedMovie}>
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 1,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  backdrop: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  movieInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  releaseDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    fontSize: 18,
    color: '#0066cc',
    fontWeight: '600',
    marginBottom: 4,
  },
  voteCount: {
    fontSize: 14,
    color: '#999',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 24,
  },
  watchedInfo: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  watchedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    fontSize: 20,
    marginRight: 4,
  },
  userRating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  userReview: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
    marginBottom: 12,
  },
  watchedDate: {
    fontSize: 14,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  watchedButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginLeft: 8,
  },
});