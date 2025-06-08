declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql: (
      sqlStatement: string,
      params?: any[]
    ) => Promise<[{ rows: { length: number; item: (index: number) => any }; insertId?: number }]>;
    close: () => Promise<void>;
  }

  export interface SQLiteStatic {
    DEBUG(enable: boolean): void;
    enablePromise(enable: boolean): void;
    openDatabase(
      name: string,
      version: string,
      displayName: string,
      size: number
    ): Promise<SQLiteDatabase>;
  }

  const SQLite: SQLiteStatic;
  export default SQLite;
}

declare namespace SQLite {
  interface SQLiteDatabase {
    executeSql: (
      sqlStatement: string,
      params?: any[]
    ) => Promise<[{ rows: { length: number; item: (index: number) => any }; insertId?: number }]>;
    close: () => Promise<void>;
  }
}