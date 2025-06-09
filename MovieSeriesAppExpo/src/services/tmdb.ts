import axios from 'axios';
import Constants from 'expo-constants';
import { Movie, TVShow } from '../types';

const TMDB_API_KEY = Constants.expoConfig?.extra?.TMDB_API_KEY || '';
const TMDB_BASE_URL = Constants.expoConfig?.extra?.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

const tmdbAxios = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'es-ES',
  },
});

export interface TMDBMovieResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBTVResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

export interface TMDBCountry {
  iso_3166_1: string;
  english_name: string;
}

export const tmdbApi = {
  // Obtener películas populares
  getPopularMovies: async (page: number = 1): Promise<TMDBMovieResponse> => {
    try {
      const response = await tmdbAxios.get('/movie/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw new Error('No se pudieron cargar las películas populares');
    }
  },

  // Obtener series populares
  getPopularTVShows: async (page: number = 1): Promise<TMDBTVResponse> => {
    try {
      const response = await tmdbAxios.get('/tv/popular', {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular TV shows:', error);
      throw new Error('No se pudieron cargar las series populares');
    }
  },

  // Buscar películas
  searchMovies: async (query: string, page: number = 1): Promise<TMDBMovieResponse> => {
    try {
      const response = await tmdbAxios.get('/search/movie', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching movies:', error);
      throw new Error('No se pudieron buscar películas');
    }
  },

  // Buscar series
  searchTVShows: async (query: string, page: number = 1): Promise<TMDBTVResponse> => {
    try {
      const response = await tmdbAxios.get('/search/tv', {
        params: { query, page },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching TV shows:', error);
      throw new Error('No se pudieron buscar series');
    }
  },

  // Obtener detalles de película
  getMovieDetails: async (movieId: number): Promise<Movie> => {
    try {
      const response = await tmdbAxios.get(`/movie/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw new Error('No se pudieron cargar los detalles de la película');
    }
  },

  // Obtener detalles de serie
  getTVShowDetails: async (tvShowId: number): Promise<TVShow> => {
    try {
      const response = await tmdbAxios.get(`/tv/${tvShowId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching TV show details:', error);
      throw new Error('No se pudieron cargar los detalles de la serie');
    }
  },

  // Obtener lista de países
  getCountries: async (): Promise<TMDBCountry[]> => {
    try {
      const response = await tmdbAxios.get('/configuration/countries');
      return response.data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      throw new Error('No se pudieron cargar los países');
    }
  },

  // Películas top por año, país y cantidad
  getTopRatedMovies: async ({
    year,
    country,
    count,
  }: { year: number; country?: string; count: number }) => {
    let results: Movie[] = [];
    let page = 1;
    while (results.length < count) {
      const response = await tmdbAxios.get('/discover/movie', {
        params: {
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100, // Para evitar pelis con pocos votos
          primary_release_year: year,
          region: country,
          page,
          language: 'es-ES',
        },
      });
      results = results.concat(response.data.results);
      if (response.data.page >= response.data.total_pages) break;
      page++;
    }
    return results.slice(0, count);
  },

  // Series top por año, país y cantidad
  getTopRatedTVShows: async ({
    year,
    country,
    count,
  }: { year: number; country?: string; count: number }) => {
    let results: TVShow[] = [];
    let page = 1;
    while (results.length < count) {
      const response = await tmdbAxios.get('/discover/tv', {
        params: {
          sort_by: 'vote_average.desc',
          'vote_count.gte': 100,
          first_air_date_year: year,
          with_origin_country: country,
          page,
          language: 'es-ES',
        },
      });
      results = results.concat(response.data.results);
      if (response.data.page >= response.data.total_pages) break;
      page++;
    }
    return results.slice(0, count);
  },
};