import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Animated,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { storageService } from '../services/storage';
import { WatchedItem, SavedItem } from '../types';
import Constants from 'expo-constants';
import { useTheme } from '../styles/ThemeContext';

type TVDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'TVDetail'>;

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

export const TVDetailScreen: React.FC<TVDetailScreenProps> = ({ route, navigation }) => {
  const { tvShow } = route.params;
  const [isWatched, setIsWatched] = useState(false);
  const [watchedItem, setWatchedItem] = useState<WatchedItem | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [watchedDate, setWatchedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const scaleAnim = new Animated.Value(1);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    checkIfWatched();
    checkIfSaved();
  }, []);

  const checkIfWatched = async () => {
    try {
      const watchedItems = await storageService.getWatchedItems();
      const existingItem = watchedItems.find(item => item.id === tvShow.id && item.type === 'tv');
      if (existingItem) {
        setIsWatched(true);
        setWatchedItem(existingItem);
        setRating(existingItem.rating);
        setReview(existingItem.review || '');
        setWatchedDate(existingItem.watchedDate ? new Date(existingItem.watchedDate) : new Date());
      }
    } catch (error) {
      console.error('Error checking watched status:', error);
    }
  };

  const checkIfSaved = async () => {
    const savedItems = await storageService.getSavedItems();
    setIsSaved(savedItems.some(item => item.id === tvShow.id && item.type === 'tv'));
  };

  const handleMarkAsWatched = () => {
    setModalVisible(true);
    setWatchedDate(new Date());
  };

  const handleSaveWatched = async () => {
    try {
      const newWatchedItem: WatchedItem = {
        id: tvShow.id,
        title: tvShow.name,
        type: 'tv',
        posterPath: tvShow.poster_path,
        rating,
        review: review.trim(),
        watchedDate: watchedDate.toISOString(),
      };

      await storageService.addWatchedItem(newWatchedItem);
      setIsWatched(true);
      setWatchedItem(newWatchedItem);
      setModalVisible(false);
      // Eliminar de guardados si estaba guardado
      await storageService.removeIfSaved(tvShow.id, 'tv');
      setIsSaved(false);
      Alert.alert('¡Listo!', 'Serie marcada como vista');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la serie');
    }
  };

  const handleEditWatched = () => {
    setModalVisible(true);
    setWatchedDate(watchedItem?.watchedDate ? new Date(watchedItem.watchedDate) : new Date());
  };

  const handleUpdateWatched = async () => {
    if (!watchedItem) return;

    try {
      const updatedItem: WatchedItem = {
        ...watchedItem,
        rating,
        review: review.trim(),
        watchedDate: watchedDate.toISOString(),
      };

      await storageService.updateWatchedItem(updatedItem);
      setWatchedItem(updatedItem);
      setModalVisible(false);
      Alert.alert('¡Actualizado!', 'Tu reseña ha sido guardada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la reseña');
    }
  };

  const handleRemoveWatched = async () => {
    if (!watchedItem) return;
    try {
      await storageService.removeWatchedItem(watchedItem.id, 'tv');
      setIsWatched(false);
      setWatchedItem(null);
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('Error eliminando serie:', error);
    }
  };

  const handleSaveForLater = async () => {
    const item: SavedItem = {
      id: tvShow.id,
      type: 'tv',
      title: tvShow.name,
      posterPath: tvShow.poster_path,
    };
    await storageService.addSavedItem(item);
    setIsSaved(true);
    Alert.alert('Guardado', 'Serie guardada para ver más tarde');
  };

  const handleRemoveSaved = async () => {
    await storageService.removeSavedItem(tvShow.id, 'tv');
    setIsSaved(false);
    Alert.alert('Eliminado', 'Serie eliminada de guardados');
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

  const renderStars = (currentRating: number, onPress?: (rating: number) => void) => {
    return Array.from({ length: 10 }, (_, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => onPress && onPress(index + 1)}
        disabled={!onPress}
      >
        <Text style={[styles.star, { color: index < currentRating ? theme.accent : theme.textSecondary }]}>
          ★
        </Text>
      </TouchableOpacity>
    ));
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={{
              uri: tvShow.backdrop_path
                ? `${TMDB_IMAGE_BASE_URL}${tvShow.backdrop_path}`
                : `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`,
            }}
            style={styles.backdrop}
          />
          <View style={styles.backdropOverlay} />
          <View style={[styles.seriesBadge, { backgroundColor: theme.accentSecondary }]}>
            <Text style={[styles.seriesBadgeText, { color: theme.background }]}>📺 SERIE</Text>
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <View style={styles.tvInfo}>
            <Image
              source={{
                uri: tvShow.poster_path
                  ? `${TMDB_IMAGE_BASE_URL}${tvShow.poster_path}`
                  : 'https://via.placeholder.com/500x750?text=No+Image',
              }}
              style={styles.poster}
            />
            <View style={styles.details}>
              <Text style={[styles.title, { color: theme.text }]}>{tvShow.name}</Text>
              <Text style={[styles.releaseDate, { color: theme.textSecondary }]}>
                {tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : 'N/A'}
              </Text>
              <View style={styles.ratingContainer}>
                <Text style={[styles.rating, { color: theme.accent }]}>⭐ {tvShow.vote_average.toFixed(1)}</Text>
                <Text style={[styles.voteCount, { color: theme.textSecondary }]}>({tvShow.vote_count} votos)</Text>
              </View>
              {tvShow.origin_country && tvShow.origin_country.length > 0 && (
                <View style={styles.countryContainer}>
                  <Text style={[styles.countryText, { color: theme.accent }]}>
                    🌍 {tvShow.origin_country.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Sinopsis */}
          <View style={styles.overviewSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Sinopsis</Text>
            <Text style={[styles.overview, { color: theme.textSecondary }]}>
              {tvShow.overview || 'No hay sinopsis disponible.'}
            </Text>
          </View>

          {/* Información adicional de la serie */}
          <View style={styles.seriesInfoSection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Información de la Serie</Text>
            <View style={[styles.infoGrid, { backgroundColor: theme.overlay }]}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Título Original</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{tvShow.original_name}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Idioma Original</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{tvShow.original_language.toUpperCase()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Popularidad</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>{tvShow.popularity.toFixed(0)}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Primera Emisión</Text>
                <Text style={[styles.infoValue, { color: theme.text }]}>
                  {tvShow.first_air_date ? new Date(tvShow.first_air_date).toLocaleDateString('es-ES') : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Información de vista */}
          {isWatched && watchedItem && (
            <View style={[styles.watchedInfo, { backgroundColor: theme.overlay }]}>
              <Text style={[styles.watchedTitle, { color: theme.text }]}>Tu Reseña</Text>
              <View style={styles.starsContainer}>
                {renderStars(watchedItem.rating)}
              </View>
              <Text style={[styles.userRating, { color: theme.accent }]}>
                Tu calificación: {watchedItem.rating}/10
              </Text>
              {watchedItem.review && (
                <>
                  <Text style={[styles.reviewTitle, { color: theme.text }]}>Tu comentario:</Text>
                  <Text style={[styles.userReview, { color: theme.textSecondary }]}>{watchedItem.review}</Text>
                </>
              )}
              <Text style={[styles.watchedDate, { color: theme.textSecondary }]}>
                Visto el {new Date(watchedItem.watchedDate).toLocaleDateString('es-ES')}
              </Text>
            </View>
          )}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            {!isWatched ? (
            <>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                  style={[styles.watchedButton, { backgroundColor: theme.accent }]}
                  onPress={handleMarkAsWatched}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  activeOpacity={0.9}
                >
                  <Text style={styles.buttonText}>Marcar como Vista</Text>
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                style={[
                  styles.watchedButton,
                  { backgroundColor: isSaved ? '#dc3545' : theme.accent, marginTop: 12 },
                ]}
                onPress={isSaved ? handleRemoveSaved : handleSaveForLater}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>
                  {isSaved ? 'Eliminar de Guardados' : 'Guardar para ver'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
              <View style={styles.actionButtons}>
                <Animated.View style={[styles.buttonFlex, { transform: [{ scale: scaleAnim }] }]}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: '#28a745' }]}
                    onPress={handleEditWatched}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.buttonText}>Editar Reseña</Text>
                  </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[styles.buttonFlex, { transform: [{ scale: scaleAnim }] }]}>
                  <TouchableOpacity
                    style={[styles.removeButton, { backgroundColor: '#dc3545' }]}
                    onPress={() => setConfirmDeleteVisible(true)}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de calificación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {isWatched ? 'Editar Reseña' : 'Calificar Serie'}
            </Text>
            <Text style={[styles.ratingLabel, { color: theme.text }]}>Calificación (1-10):</Text>
            <View style={styles.starsContainer}>
              {renderStars(rating, setRating)}
            </View>
            <Text style={[styles.ratingValue, { color: theme.accent }]}>{rating}/10</Text>
            <Text style={[styles.reviewLabel, { color: theme.text }]}>Comentario (opcional):</Text>
            <TextInput
              style={[styles.reviewInput, { color: theme.text, backgroundColor: theme.overlay, borderColor: theme.border }]}
              placeholder="¿Qué te pareció esta serie?"
              placeholderTextColor={theme.textSecondary}
              value={review}
              onChangeText={setReview}
              multiline
              numberOfLines={4}
            />
            <Text style={[styles.reviewLabel, { color: theme.text }]}>Fecha de visualización:</Text>
            <TouchableOpacity
              style={[styles.datePickerButton, { backgroundColor: theme.overlay }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.datePickerText, { color: theme.text }]}>
                {watchedDate
                  ? watchedDate.toLocaleDateString('es-ES')
                  : 'Selecciona una fecha'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={watchedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setWatchedDate(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.textSecondary }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.accent }]}
                onPress={isWatched ? handleUpdateWatched : handleSaveWatched}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal de confirmación de eliminación */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmDeleteVisible}
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>¿Eliminar de tu lista?</Text>
            <Text style={{ color: theme.textSecondary, marginBottom: 20, textAlign: 'center' }}>
              ¿Seguro que quieres eliminar esta serie de tu lista?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.textSecondary }]}
                onPress={() => setConfirmDeleteVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: '#dc3545' }]}
                onPress={async () => {
                  setConfirmDeleteVisible(false);
                  await handleRemoveWatched();
                }}
              >
                <Text style={styles.buttonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdropContainer: {
    position: 'relative',
    height: 250,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  seriesBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seriesBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'System',
  },
  content: {
    padding: 20,
    marginTop: -50,
  },
  tvInfo: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
    marginRight: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  releaseDate: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'System',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'System',
  },
  voteCount: {
    fontSize: 14,
    fontFamily: 'System',
  },
  countryContainer: {
    marginTop: 4,
  },
  countryText: {
    fontSize: 14,
    fontFamily: 'System',
  },
  overviewSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 12,
    fontFamily: 'System',
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'System',
  },
  seriesInfoSection: {
    marginBottom: 24,
  },
  infoGrid: {
    borderRadius: 12,
    padding: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
    fontFamily: 'System',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    fontFamily: 'System',
  },
  watchedInfo: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  watchedTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  star: {
    fontSize: 24,
    marginRight: 4,
  },
  userRating: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  userReview: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'System',
  },
  watchedDate: {
    fontSize: 14,
    fontFamily: 'System',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonFlex: {
    flex: 1,
  },
  watchedButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  removeButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'System',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    padding: 24,
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'System',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'System',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontFamily: 'System',
  },
  datePickerButton: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  saveButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
});