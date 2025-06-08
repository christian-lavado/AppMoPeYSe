import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_ACCESS_TOKEN } from '@env';
import { Movie, TVShow, Genre } from '../types';

const api = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const tmdbApi = {
  // Búsqueda de películas
  searchMovies: async (query: string, page: number = 1) => {
    const response = await api.get('/search/movie', {
      params: { query, page, language: 'es-ES' }
    });
    return response.data;
  },

  // Búsqueda de series
  searchTVShows: async (query: string, page: number = 1) => {
    const response = await api.get('/search/tv', {
      params: { query, page, language: 'es-ES' }
    });
    return response.data;
  },

  // Películas populares
  getPopularMovies: async (page: number = 1) => {
    const response = await api.get('/movie/popular', {
      params: { page, language: 'es-ES' }
    });
    return response.data;
  },

  // Series populares
  getPopularTVShows: async (page: number = 1) => {
    const response = await api.get('/tv/popular', {
      params: { page, language: 'es-ES' }
    });
    return response.data;
  },

  // Detalles de película
  getMovieDetails: async (movieId: number) => {
    const response = await api.get(`/movie/${movieId}`, {
      params: { language: 'es-ES' }
    });
    return response.data;
  },

  // Detalles de serie
  getTVShowDetails: async (tvId: number) => {
    const response = await api.get(`/tv/${tvId}`, {
      params: { language: 'es-ES' }
    });
    return response.data;
  },

  // Géneros de películas
  getMovieGenres: async () => {
    const response = await api.get('/genre/movie/list', {
      params: { language: 'es-ES' }
    });
    return response.data;
  },

  // Géneros de series
  getTVGenres: async () => {
    const response = await api.get('/genre/tv/list', {
      params: { language: 'es-ES' }
    });
    return response.data;
  },
};