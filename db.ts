import { MaintenanceItem, MaintenanceRecord, StockHolding, Goal, ExpenseRecord, Muse } from './types';
import { INITIAL_MAINTENANCE, INITIAL_STOCKS, INITIAL_GOALS, INITIAL_MUSES } from './constants';

const DB_NAME = 'LifeOS_Database';
const DB_VERSION = 3; // Bump version for Muses store

interface DBData {
  items: MaintenanceItem[];
  records: MaintenanceRecord[];
  stocks: StockHolding[];
  goals: Goal[];
  expenses: ExpenseRecord[];
  muses: Muse[];
  settings: Record<string, any>;
}

class LifeOSDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject('Failed to open database');
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create Object Stores
        if (!db.objectStoreNames.contains('maintenance_items')) {
          db.createObjectStore('maintenance_items', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('maintenance_records')) {
          db.createObjectStore('maintenance_records', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('stocks')) {
          db.createObjectStore('stocks', { keyPath: 'symbol' });
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('expenses')) {
          db.createObjectStore('expenses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('muses')) {
          db.createObjectStore('muses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        await this.migrateFromLocalStorage();
        resolve();
      };
    });

    return this.initPromise;
  }

  private async migrateFromLocalStorage() {
    // Check if migration is needed (presence of LS data)
    const hasLSData = localStorage.getItem('LIFEOS_CAR_ITEMS') || localStorage.getItem('LIFEOS_STOCKS');
    
    // Always check/init muses if empty
    const musesCount = await this.count('muses');
    if (musesCount === 0) {
        await this.saveAll('muses', INITIAL_MUSES);
    }

    if (hasLSData) {
      console.log('Migrating data from LocalStorage to IndexedDB...');
      
      try {
        const items = JSON.parse(localStorage.getItem('LIFEOS_CAR_ITEMS') || '[]');
        const records = JSON.parse(localStorage.getItem('LIFEOS_CAR_RECORDS') || '[]');
        const stocks = JSON.parse(localStorage.getItem('LIFEOS_STOCKS') || '[]');
        const goals = JSON.parse(localStorage.getItem('LIFEOS_GOALS') || '[]');
        
        const mileage = localStorage.getItem('LIFEOS_CAR_MILEAGE');
        const model = localStorage.getItem('LIFEOS_CAR_MODEL');
        const plate = localStorage.getItem('LIFEOS_CAR_NUMBER');

        if (items.length) await this.saveAll('maintenance_items', items);
        if (records.length) await this.saveAll('maintenance_records', records);
        if (stocks.length) await this.saveAll('stocks', stocks);
        if (goals.length) await this.saveAll('goals', goals);
        
        if (mileage) await this.setSetting('car_mileage', mileage);
        if (model) await this.setSetting('car_model', model);
        if (plate) await this.setSetting('car_plate', plate);

        console.log('Migration successful');
      } catch (e) {
        console.error('Migration failed', e);
      }
    } else {
       // Initialize with default constants if empty
       const count = await this.count('maintenance_items');
       if (count === 0) {
          await this.saveAll('maintenance_items', INITIAL_MAINTENANCE);
          await this.saveAll('stocks', INITIAL_STOCKS);
          await this.saveAll('goals', INITIAL_GOALS);
       }
    }
  }

  private getTransaction(storeName: string, mode: IDBTransactionMode = 'readonly') {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.transaction(storeName, mode).objectStore(storeName);
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const request = this.getTransaction(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async save<T>(storeName: string, item: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getTransaction(storeName, 'readwrite').put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async saveAll<T>(storeName: string, items: T[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      items.forEach(item => store.put(item));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(storeName: string, key: string | number): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getTransaction(storeName, 'readwrite').delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    return new Promise((resolve) => {
      const request = this.getTransaction('settings').get(key);
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => resolve(null);
    });
  }

  async setSetting(key: string, value: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = this.getTransaction('settings', 'readwrite').put({ key, value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  async count(storeName: string): Promise<number> {
      return new Promise((resolve) => {
          const request = this.getTransaction(storeName).count();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => resolve(0);
      });
  }

  // Helper for full data export (Cloud Sync)
  async exportAllData(): Promise<any> {
      const items = await this.getAll('maintenance_items');
      const records = await this.getAll('maintenance_records');
      const stocks = await this.getAll('stocks');
      const goals = await this.getAll('goals');
      const expenses = await this.getAll('expenses');
      const muses = await this.getAll('muses');
      const mileage = await this.getSetting('car_mileage');
      const model = await this.getSetting('car_model');
      const plate = await this.getSetting('car_plate');
      
      return {
          stocks,
          carItems: items,
          carRecords: records,
          carMileage: Number(mileage) || 0,
          carModel: model || '',
          carNumber: plate || '',
          goals,
          expenses,
          muses,
          timestamp: new Date().toISOString()
      };
  }
  
  // Helper for full data import (Cloud Sync)
  async importAllData(data: any): Promise<void> {
      if (data.carItems) await this.saveAll('maintenance_items', data.carItems);
      if (data.carRecords) await this.saveAll('maintenance_records', data.carRecords);
      if (data.stocks) await this.saveAll('stocks', data.stocks);
      if (data.goals) await this.saveAll('goals', data.goals);
      if (data.expenses) await this.saveAll('expenses', data.expenses);
      if (data.muses) await this.saveAll('muses', data.muses);
      
      if (data.carMileage) await this.setSetting('car_mileage', data.carMileage);
      if (data.carModel) await this.setSetting('car_model', data.carModel);
      if (data.carNumber) await this.setSetting('car_plate', data.carNumber);
  }
}

export const db = new LifeOSDB();