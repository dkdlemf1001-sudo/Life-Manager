
import { MaintenanceItem, MaintenanceRecord, StockHolding, Goal, ExpenseRecord, Muse } from './types';
import { INITIAL_MAINTENANCE, INITIAL_STOCKS, INITIAL_GOALS, INITIAL_MUSES } from './constants';

const DB_NAME = 'LifeOS_Database_V2'; // 버전을 명시적으로 관리하여 충돌 방지
const DB_VERSION = 1;

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
        
        // 필수 스토어 생성
        const stores = [
          'maintenance_items', 'maintenance_records', 'stocks', 
          'goals', 'expenses', 'muses', 'settings'
        ];
        
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: store === 'stocks' ? 'symbol' : (store === 'settings' ? 'key' : 'id') });
          }
        });
      };

      request.onsuccess = async (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        await this.ensureInitialData();
        resolve();
      };
    });

    return this.initPromise;
  }

  private async ensureInitialData() {
    // 데이터가 하나도 없을 때만 초기 샘플 데이터를 로드함
    const musesCount = await this.count('muses');
    if (musesCount === 0) {
      await this.saveAll('muses', INITIAL_MUSES);
    }
    
    const maintenanceCount = await this.count('maintenance_items');
    if (maintenanceCount === 0) {
      await this.saveAll('maintenance_items', INITIAL_MAINTENANCE);
      await this.saveAll('stocks', INITIAL_STOCKS);
      await this.saveAll('goals', INITIAL_GOALS);
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

  async exportAllData(): Promise<any> {
    const stores = ['maintenance_items', 'maintenance_records', 'stocks', 'goals', 'expenses', 'muses'];
    const data: any = { timestamp: new Date().toISOString() };
    for (const store of stores) {
      data[store] = await this.getAll(store);
    }
    data.carMileage = await this.getSetting('car_mileage');
    data.carModel = await this.getSetting('car_model');
    data.carPlate = await this.getSetting('car_plate');
    return data;
  }

  async importAllData(data: any): Promise<void> {
    if (data.muses) await this.saveAll('muses', data.muses);
    if (data.stocks) await this.saveAll('stocks', data.stocks);
    if (data.goals) await this.saveAll('goals', data.goals);
    if (data.expenses) await this.saveAll('expenses', data.expenses);
    if (data.maintenance_items) await this.saveAll('maintenance_items', data.maintenance_items);
    if (data.maintenance_records) await this.saveAll('maintenance_records', data.maintenance_records);
    if (data.carMileage) await this.setSetting('car_mileage', data.carMileage);
    if (data.carModel) await this.setSetting('car_model', data.carModel);
    if (data.carPlate) await this.setSetting('car_plate', data.carPlate);
  }
}

export const db = new LifeOSDB();
