import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchedItem } from '../types';

class StorageService {
  private WATCHED_ITEMS_KEY = 'watched_items';
  private SAVED_KEY = 'saved_items';
  private listeners: SavedListener[] = [];

  async initDB(): Promise<void> {
    console.log('Storage initialized successfully');
  }

  async addWatchedItem(item: WatchedItem): Promise<number> {
    try {
      const existingItems = await this.getWatchedItems();
      
      // Verificar si ya existe usando tmdb_id y type (no id)
      const existingIndex = existingItems.findIndex(
        existing => existing.id === item.id && existing.type === item.type
      );

      const newItem: WatchedItem = {
        ...item,
        watchedDate: new Date().toISOString(),
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
      return items.find(item => item.id === tmdbId && item.type === type) || null;
    } catch (error) {
      console.error('Error getting watched item:', error);
      return null;
    }
  }

  async updateWatchedItem(updatedItem: WatchedItem): Promise<void> {
    try {
      const items = await this.getWatchedItems();
      const index = items.findIndex(item => item.id === updatedItem.id && item.type === updatedItem.type);
      
      if (index >= 0) {
        items[index] = updatedItem;
        await AsyncStorage.setItem(this.WATCHED_ITEMS_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error updating watched item:', error);
      throw error;
    }
  }

  async removeWatchedItem(tmdbId: number, type: 'movie' | 'tv'): Promise<void> {
    try {
      console.log(`Eliminando item - ID: ${tmdbId}, Type: ${type}`);
      
      const items = await this.getWatchedItems();
      console.log('Items antes de filtrar:', items.length);
      console.log('Items actuales:', items.map(i => `${i.id}-${i.type}`));
      
      const filteredItems = items.filter(item => !(item.id === tmdbId && item.type === type));
      console.log('Items después de filtrar:', filteredItems.length);
      
      await AsyncStorage.setItem(this.WATCHED_ITEMS_KEY, JSON.stringify(filteredItems));
      console.log('Storage actualizado exitosamente');
    } catch (error) {
      console.error('Error deleting watched item:', error);
      throw error;
    }
  }

  async closeDB(): Promise<void> {
    // AsyncStorage no necesita cerrar conexión
  }

  async getSavedItems(): Promise<SavedItem[]> {
    const json = await AsyncStorage.getItem(this.SAVED_KEY);
    return json ? JSON.parse(json) : [];
  }

  async addSavedItem(item: SavedItem): Promise<void> {
    const items = await this.getSavedItems();
    if (!items.find(i => i.id === item.id && i.type === item.type)) {
      items.push(item);
      await AsyncStorage.setItem(this.SAVED_KEY, JSON.stringify(items));
      this.notify();
    }
  }

  async removeSavedItem(id: number, type: 'movie' | 'tv'): Promise<void> {
    let items = await this.getSavedItems();
    items = items.filter(i => !(i.id === id && i.type === type));
    await AsyncStorage.setItem(this.SAVED_KEY, JSON.stringify(items));
    this.notify();
  }

  async clearSaved(): Promise<void> {
    await AsyncStorage.removeItem(this.SAVED_KEY);
    this.notify();
  }

  // Para eliminar de guardados cuando se marca como visto
  async removeIfSaved(id: number, type: 'movie' | 'tv'): Promise<void> {
    await this.removeSavedItem(id, type);
  }

  // Subscripción para refrescar la lista en pantalla
  subscribeSaved(listener: SavedListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l());
  }
}

export const storageService = new StorageService();