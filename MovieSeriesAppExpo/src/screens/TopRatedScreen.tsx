import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigator';
import { tmdbApi, TMDBCountry } from '../services/tmdb';
import { Movie, TVShow } from '../types';
import Constants from 'expo-constants';
import { useTheme } from '../styles/ThemeContext';
import { Picker } from '@react-native-picker/picker';
import CountryFlag from 'react-native-country-flag';

const TMDB_IMAGE_BASE_URL = Constants.expoConfig?.extra?.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

type TopRatedScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'TopRated'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TopRatedScreenProps = {
  navigation: TopRatedScreenNavigationProp;
};

export const TopRatedScreen: React.FC<TopRatedScreenProps> = ({ navigation }) => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [count, setCount] = useState('10');
  const [country, setCountry] = useState('');
  const [type, setType] = useState<'movie' | 'tv'>('movie');
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<TMDBCountry[]>([]);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (type === 'tv' && Platform.OS !== 'ios') {
      tmdbApi.getCountries()
        .then((data) => {
          setCountries([...data].sort((a, b) => a.english_name.localeCompare(b.english_name)));
        })
        .catch(() => setCountries([]));
    }
  }, [type]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setResults([]);
    Keyboard.dismiss();
    const yearNum = parseInt(year);
    const countNum = parseInt(count);
    if (!year || isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear()) {
      setError('Introduce un año válido');
      setLoading(false);
      return;
    }
    if (!count || isNaN(countNum) || countNum < 1 || countNum > 100) {
      setError('Introduce una cantidad entre 1 y 100');
      setLoading(false);
      return;
    }
    try {
      if (type === 'movie') {
        const movies = await tmdbApi.getTopRatedMovies({
          year: yearNum,
          count: countNum,
        });
        setResults(movies);
      } else {
        const tvs = await tmdbApi.getTopRatedTVShows({
          year: yearNum,
          country: Platform.OS !== 'ios' ? (country || undefined) : undefined,
          count: countNum,
        });
        setResults(tvs);
      }
    } catch (e) {
      setError('No se pudo cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item: Movie | TVShow) => {
    if ('title' in item) {
      navigation.navigate('MovieDetail', { movie: item });
    } else {
      navigation.navigate('TVDetail', { tvShow: item });
    }
  };

  const renderItem = ({ item }: { item: Movie | TVShow }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      onPress={() => handleItemPress(item)}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri: item.poster_path
            ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Image',
        }}
        style={styles.poster}
      />
      <View style={styles.info}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
          {'title' in item ? item.title : item.name}
        </Text>
        <Text style={[styles.year, { color: theme.textSecondary }]}>
          {'release_date' in item
            ? item.release_date?.split('-')[0]
            : item.first_air_date?.split('-')[0]}
        </Text>
        <Text style={[styles.rating, { color: theme.accent }]}>⭐ {item.vote_average.toFixed(1)}</Text>
        <Text style={[styles.votes, { color: theme.textSecondary }]}>
          {item.vote_count} votos
        </Text>
        {'origin_country' in item && item.origin_country && item.origin_country.length > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <CountryFlag isoCode={item.origin_country[0]} size={16} />
            <Text style={{ color: theme.textSecondary, marginLeft: 4, fontSize: 12 }}>
              {item.origin_country[0]}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const selectedCountry = countries.find(c => c.iso_3166_1 === country);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Ranking por año</Text>
          <TouchableOpacity onPress={toggleTheme} style={{ marginLeft: 12 }}>
            <Text style={{ fontSize: 20 }}>
              {theme.mode === 'dark' ? '☀️' : '🌑'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.form}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'movie' && { backgroundColor: theme.accent },
            ]}
            onPress={() => { setType('movie'); setCountry(''); }}
          >
            <Text style={[styles.typeButtonText, type === 'movie' && { color: theme.background }]}>Películas</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'tv' && { backgroundColor: theme.accent },
            ]}
            onPress={() => setType('tv')}
          >
            <Text style={[styles.typeButtonText, type === 'tv' && { color: theme.background }]}>Series</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Año</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.overlay }]}
              placeholder="Año"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={year}
              onChangeText={setYear}
              maxLength={4}
              returnKeyType="done"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Cantidad</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.overlay }]}
              placeholder="Cantidad"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={count}
              onChangeText={setCount}
              maxLength={3}
              returnKeyType="done"
            />
          </View>
        </View>
        {type === 'tv' && Platform.OS !== 'ios' && (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>País (opcional)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.overlay, borderColor: theme.border, flex: 1 }]}>
                  <Picker
                    selectedValue={country}
                    style={Platform.OS === 'android' ? { color: theme.text, flex: 1 } : { flex: 1 }}
                    onValueChange={(value) => setCountry(value)}
                  >
                    <Picker.Item label="Todos los países" value="" />
                    {countries.map((c) => (
                      <Picker.Item
                        key={c.iso_3166_1}
                        label={c.english_name}
                        value={c.iso_3166_1}
                      />
                    ))}
                  </Picker>
                </View>
                {selectedCountry && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                    <CountryFlag isoCode={selectedCountry.iso_3166_1} size={24} />
                    <Text style={{ color: theme.textSecondary, marginLeft: 4, fontSize: 14 }}>
                      {selectedCountry.iso_3166_1}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: theme.accent }]}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
        {error ? <Text style={{ color: 'red', marginTop: 8 }}>{error}</Text> : null}
      </View>
      {loading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.id}`}
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
  form: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  typeButtonText: {
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'System',
    color: '#999999',
  },
  label: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontFamily: 'System',
    fontSize: 14,
    backgroundColor: '#fff',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingRight: 0,
    paddingLeft: 0,
    marginTop: 2,
  },
  searchButton: {
    marginTop: 8,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
  year: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'System',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: 'System',
  },
  votes: {
    fontSize: 12,
    fontFamily: 'System',
  },
});