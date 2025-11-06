import AsyncStorage from '@react-native-async-storage/async-storage';

// Универсальное хранилище, работающее на всех платформах
// class UniversalStorage {
//   async setItem(key: string, value: string): Promise<void> {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Веб-версия
//       localStorage.setItem(key, value);
//     } else {
//       // Мобильная версия
//       await AsyncStorage.setItem(key, value);
//     }
//   }

//   async getItem(key: string): Promise<string | null> {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Веб-версия
//       return localStorage.getItem(key);
//     } else {
//       // Мобильная версия
//       return AsyncStorage.getItem(key);
//     }
//   }

//   async removeItem(key: string): Promise<void> {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Веб-версия
//       localStorage.removeItem(key);
//     } else {
//       // Мобильная версия
//       await AsyncStorage.removeItem(key);
//     }
//   }

//   async clear(): Promise<void> {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Веб-версия
//       localStorage.clear();
//     } else {
//       // Мобильная версия
//       await AsyncStorage.clear();
//     }
//   }
// }

// Универсальное хранилище, работающее на всех платформах
class UniversalStorage {
  private isWeb: boolean;

  constructor() {
    // Более надежная проверка на веб-окружение
    this.isWeb = typeof document !== 'undefined' && !!document.createElement;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      // Веб-версия
      localStorage.setItem(key, value);
    } else {
      // Мобильная версия
      await AsyncStorage.setItem(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      // Веб-версия
      return localStorage.getItem(key);
    } else {
      // Мобильная версия
      return AsyncStorage.getItem(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      // Веб-версия
      localStorage.removeItem(key);
    } else {
      // Мобильная версия
      await AsyncStorage.removeItem(key);
    }
  }

  async clear(): Promise<void> {
    if (this.isWeb && typeof localStorage !== 'undefined') {
      // Веб-версия
      localStorage.clear();
    } else {
      // Мобильная версия
      await AsyncStorage.clear();
    }
  }
}

export const storage = new UniversalStorage();