import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';


export default function RegisterScreen() {
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordPovtor, setPasswordPovtor] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordPovtor, setShowPasswordPovtor] = useState(false);
  const { theme } = useTheme(); 
  const styles = getStyles(theme);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const togglePasswordPovtorVisibility = () => {
    setShowPasswordPovtor(!showPasswordPovtor);
  };

  const { register } = useAuth();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showNotification = (message: string, type: string) => {
    if (Platform.OS === 'web') {
      // Для веб-версии используем браузерные уведомления
      if (type === 'error') {
        alert(`Ошибка: ${message}`);
      } else {
        alert(message);
      }
    } else {
      // Для мобильных устройств используем Toast
      if (type === 'error') {
        Alert.alert('Ошибка', message);
      } else {
        Alert.alert(message);
      }
    }
  };

  const handleDateSelection = () => {
    if (Platform.OS === 'web') {
      // Создаем скрытый input type="date"
      const input = document.createElement('input');
      input.type = 'date';
      input.max = new Date().toISOString().split('T')[0];
      
      if (dateOfBirth) {
        input.value = dateOfBirth;
      }
      
      // Обработчик выбора даты
      input.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.value) {
          setDateOfBirth(target.value);
        }
      };
      
      // Запускаем выбор даты
      input.showPicker();
    } else {
      setShowDatePicker(true);
    }
  };


  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDate(date);
      setDateOfBirth(formattedDate);
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !username.trim() || !passwordPovtor.trim()) {
      showNotification('Пожалуйста, заполните обязательные поля', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Введите корректный адрес почты', 'error')
      return;
    }

    if (password.length < 8) {
      showNotification('Пароль должен быть минимум 8 симловов', 'error')
      return;
    }

    if (password !== passwordPovtor) {
      showNotification('Пароли не совпадают', 'error')
      return;
    }

    setIsLoading(true);

    try {
      await register({
        email,
        password,
        username,
        date_of_birth: dateOfBirth || undefined,
        country: country || undefined
      });
      
      router.replace('/'); 
      showNotification('Регистрация прошла успешна','Успех')

      
    } catch (error: any) {
      showNotification('Ошибка регистрации', 'error')
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/');  // Назад к экрану входа
  };

  return (
    <ScrollView  contentContainerStyle={styles.container}>
      <Text style={styles.title}>Регистрация</Text>
        <View style={styles.form}>

          <TextInput
            style={styles.input}
            placeholder="Email *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Пароль (не менее 8 символов) *"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={togglePasswordVisibility}
            >
            <Ionicons 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color="#fff" 
            />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Повтор пароля *"
              value={passwordPovtor}
              onChangeText={setPasswordPovtor}
              secureTextEntry={!showPasswordPovtor}
              placeholderTextColor="#888"
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={togglePasswordPovtorVisibility}
            >
            <Ionicons 
              name={showPasswordPovtor? "eye-off" : "eye"} 
              size={20} 
              color="#fff" 
            />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Имя пользователя *"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#888"
          />

          <TouchableOpacity onPress={handleDateSelection} style={styles.dateInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Дата рождения (гггг-мм-дд)"
              value={dateOfBirth}
              placeholderTextColor="#888"
              editable={false}
            />
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Страна"
            value={country}
            onChangeText={setCountry}
            placeholderTextColor="#888"
          />

          {/* DateTimePicker для мобильных устройств */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              locale="ru-RU"
            />
          )}

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleGoBack}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>Назад к входу</Text>
          </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: theme.background,
  },
  form: {
    width: '70%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  input: {
    backgroundColor: theme.backgroundSecondary,
    color: theme.text,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1, 
    borderColor: theme.border,
  },
  button: {
    backgroundColor: theme.accent,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: theme.backgroundSecondary,
  },
  buttonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  loginButtonText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateInputContainer: {
    position: 'relative',
  }, 
  calendarIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    fontSize: 18,
  },
   passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 5,
  },
  eyeIcon: {
    fontSize: 18,
  },
});