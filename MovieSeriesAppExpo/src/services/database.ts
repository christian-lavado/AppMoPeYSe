import SQLite from 'react-native-sqlite-storage';
import { WatchedItem } from '../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'AppMoPeYSe.db';
const database_version = '1.0';
const database_displayname = 'AppMoPeYSe Database';
const database_size = 200000;

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initDB(): Promise<SQLite.SQLiteDatabase> {
    return new Promise((resolve, reject) => {
      SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
      )
        .then((db: SQLite.SQLiteDatabase) => {
          this.db = db;
          this.createTables();
          resolve(db);
        })
        .catch((error) => {
          console.log('Error opening database: ', error);
          reject(error);
        });
    });
  }

  async createTables(): Promise<void> {
    if (!this.db) return;

    const createWatchedItemsTable = `
      CREATE TABLE IF NOT EXISTS watched_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tmdb_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('movie', 'tv')),
        poster_path TEXT,
        user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 10),
        user_review TEXT,
        watched_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tmdb_id, type)
      );
    `;

    try {
      await this.db.executeSql(createWatchedItemsTable);
      console.log('Tabla watched_items creada correctamente');
    } catch (error) {
      console.error('Error creando tabla watched_items:', error);
    }
  }

  async addWatchedItem(item: Omit<WatchedItem, 'id' | 'created_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO watched_items 
      (tmdb_id, title, type, poster_path, user_rating, user_review, watched_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      const result = await this.db.executeSql(query, [
        item.tmdb_id,
        item.title,
        item.type,
        item.poster_path,
        item.user_rating,
        item.user_review,
        item.watched_date,
      ]);
      return result[0].insertId || 0;
    } catch (error) {
      console.error('Error adding watched item:', error);
      throw error;
    }
  }

  async getWatchedItems(): Promise<WatchedItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM watched_items ORDER BY created_at DESC';

    try {
      const result = await this.db.executeSql(query);
      const items: WatchedItem[] = [];
      
      for (let i = 0; i < result[0].rows.length; i++) {
        items.push(result[0].rows.item(i));
      }
      
      return items;
    } catch (error) {
      console.error('Error getting watched items:', error);
      throw error;
    }
  }

  async getWatchedItem(tmdbId: number, type: 'movie' | 'tv'): Promise<WatchedItem | null> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'SELECT * FROM watched_items WHERE tmdb_id = ? AND type = ?';

    try {
      const result = await this.db.executeSql(query, [tmdbId, type]);
      
      if (result[0].rows.length > 0) {
        return result[0].rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting watched item:', error);
      throw error;
    }
  }

  async updateWatchedItem(id: number, updates: Partial<WatchedItem>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'created_at');
    const values = fields.map(field => updates[field as keyof WatchedItem]);
    
    const query = `
      UPDATE watched_items 
      SET ${fields.map(field => `${field} = ?`).join(', ')}
      WHERE id = ?
    `;

    try {
      await this.db.executeSql(query, [...values, id]);
    } catch (error) {
      console.error('Error updating watched item:', error);
      throw error;
    }
  }

  async deleteWatchedItem(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = 'DELETE FROM watched_items WHERE id = ?';

    try {
      await this.db.executeSql(query, [id]);
    } catch (error) {
      console.error('Error deleting watched item:', error);
      throw error;
    }
  }

  async closeDB(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const databaseService = new DatabaseService();