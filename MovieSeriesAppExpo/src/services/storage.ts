import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { WatchedItem } from '../types';

class StorageService {
  private WATCHED_ITEMS_KEY = 'watched_items';

  async initDB(): Promise<void> {
    // Para AsyncStorage no necesitamos inicialización especial
    console.log('Storage initialized successfully');
  }

  async addWatchedItem(item: Omit<WatchedItem, 'id' | 'created_at'>): Promise<number> {
    try {
      const existingItems = await this.getWatchedItems();
      
      // Verificar si ya existe
      const existingIndex = existingItems.findIndex(
        existing => existing.tmdb_id === item.tmdb_id && existing.type === item.type
      );

      const newItem: WatchedItem = {
        ...item,
        id: existingIndex >= 0 ? existingItems[existingIndex].id : Date.now(),
        created_at: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        // Actualizar existente
        existingItems[existingIndex] = newItem;
      } else {
        // Agregar nuevo
        existingItems.push(newItem);
      }

      await AsyncStorage.setItem(this.WATCHED_ITEMS_KEY, JSON.stringify(existingItems));
      return newItem.id;
    } catch (error) {
      console.error('Error adding watched item:', error);
      throw error;
    }
  }

  async getWatchedItems(): Promise<WatchedItem[]> {
    try {
      const items = await AsyncStorage.getItem(this.WATCHED_ITEMS_KEY);
      return items ? JSON.parse(items) : [];
    } catch (error) {
      console.error('Error getting watched items:', error);
      return [];
    }
  }

  async getWatchedItem(tmdbId: number, type: 'movie' | 'tv'): Promise<WatchedItem | null> {
    try {
      const items = await this.getWatchedItems();
      return items.find(item => item.tmdb_id === tmdbId && item.type === type) || null;
    } catch (error) {
      console.error('Error getting watched item:', error);
      return null;
    }
  }

  async updateWatchedItem(id: number, updates: Partial<WatchedItem>): Promise<void> {
    try {
      const items = await this.getWatchedItems();
      const index = items.findIndex(item => item.id === id);
      
      if (index >= 0) {
        items[index] = { ...items[index], ...updates };
        await AsyncStorage.setItem(this.WATCHED_ITEMS_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error updating watched item:', error);
      throw error;
    }
  }

  async deleteWatchedItem(id: number): Promise<void> {
    try {
      const items = await this.getWatchedItems();
      const filteredItems = items.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.WATCHED_ITEMS_KEY, JSON.stringify(filteredItems));
    } catch (error) {
      console.error('Error deleting watched item:', error);
      throw error;
    }
  }

  async closeDB(): Promise<void> {
    // AsyncStorage no necesita cerrar conexión
  }
}

export const storageService = new StorageService();