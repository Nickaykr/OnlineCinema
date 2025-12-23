import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class UniversalStorage {
  private isWeb = Platform.OS === 'web';

  async setItem(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(key);
    } else {
      return AsyncStorage.getItem(key);
    }
  }
  

  async setSecureItem(key: string, value: string): Promise<void> {
    if (this.isWeb) {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  async getSecureItem(key: string): Promise<string | null> {
    if (this.isWeb) {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  async removeSecureItem(key: string): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      localStorage.clear();
    } else {
      await AsyncStorage.clear();
    }
  }
}

export const storage = new UniversalStorage();