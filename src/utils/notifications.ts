import { Alert, Platform } from 'react-native';

/**
 * Универсальная функция уведомлений
 * @param message - Текст сообщения
 * @param type - Тип ('error', 'success', 'info')
 */
export const showNotification = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
  if (Platform.OS === 'web') {
    if (type === 'error') {
      alert(`❌ Ошибка: ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  } else {
    // Для мобилок используем нативный Alert
    const title = type === 'error' ? 'Ошибка' : 'Уведомление';
    Alert.alert(title, message);
  }
};

export const showConfirm = (
  title: string, 
  message: string, 
  onConfirm: () => void, 
  confirmText: string = "Да"
) => {
  if (Platform.OS === 'web') {
    // Браузерное окно подтверждения
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    // Нативный диалог с кнопками
    Alert.alert(
      title,
      message,
      [
        { text: "Отмена", style: "cancel" },
        { 
          text: confirmText, 
          onPress: onConfirm,
          style: "default" 
        }
      ]
    );
  }
};