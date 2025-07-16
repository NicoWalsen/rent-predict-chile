import * as SecureStore from 'expo-secure-store';

// Security: Secure storage service for sensitive data
export class StorageService {
  private static instance: StorageService;
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Security: Store data securely
  async setSecureItem(key: string, value: string): Promise<boolean> {
    try {
      await SecureStore.setItemAsync(key, value);
      return true;
    } catch (error) {
      console.error(`Error storing secure item ${key}:`, error);
      return false;
    }
  }

  // Security: Retrieve data securely
  async getSecureItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Error retrieving secure item ${key}:`, error);
      return null;
    }
  }

  // Security: Delete data securely
  async deleteSecureItem(key: string): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error(`Error deleting secure item ${key}:`, error);
      return false;
    }
  }

  // Save user preferences
  async saveUserPreferences(preferences: {
    lastComuna?: string;
    defaultM2?: number;
    defaultEstacionamientos?: number;
    defaultBodega?: boolean;
  }): Promise<boolean> {
    try {
      const prefsString = JSON.stringify(preferences);
      return await this.setSecureItem('user_preferences', prefsString);
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Load user preferences
  async loadUserPreferences(): Promise<{
    lastComuna?: string;
    defaultM2?: number;
    defaultEstacionamientos?: number;
    defaultBodega?: boolean;
  } | null> {
    try {
      const prefsString = await this.getSecureItem('user_preferences');
      if (!prefsString) return null;
      
      return JSON.parse(prefsString);
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return null;
    }
  }

  // Save search history (limited to last 10 searches)
  async saveSearchHistory(search: {
    comuna: string;
    m2: number;
    estacionamientos: number;
    bodega: boolean;
    result: any;
    timestamp: number;
  }): Promise<boolean> {
    try {
      const historyString = await this.getSecureItem('search_history');
      let history: any[] = historyString ? JSON.parse(historyString) : [];
      
      // Add new search at the beginning
      history.unshift(search);
      
      // Keep only last 10 searches
      history = history.slice(0, 10);
      
      return await this.setSecureItem('search_history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving search history:', error);
      return false;
    }
  }

  // Load search history
  async loadSearchHistory(): Promise<any[]> {
    try {
      const historyString = await this.getSecureItem('search_history');
      return historyString ? JSON.parse(historyString) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  // Clear all stored data
  async clearAllData(): Promise<boolean> {
    try {
      await this.deleteSecureItem('user_preferences');
      await this.deleteSecureItem('search_history');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
}

export const storageService = StorageService.getInstance();