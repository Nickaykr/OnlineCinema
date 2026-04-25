import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert,
  Platform,
  StyleSheet, Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';

export default function WelcomeScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      showNotification('Пожалуйста, заполните все поля','Ошибка')
      return;
    }

    try {
      await login(email, password);

      router.replace('/main');
    } catch (error: any) {
      const errorMessage = error.message || 'Произошла ошибка при авторизации';
      showNotification(errorMessage,'Ошибка')
      setPassword('');
    }
  };

  const handleRegister = (): void => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    showNotification('Функция восстановления пароля временно недоступна. Пожалуйста, обратитесь в поддержку.', 'info');
  };

  const { theme } = useTheme(); 
  const styles = getStyles(theme);

  return (
      <View style={styles.container}>
        <Text style={styles.title}>#КиноБанда</Text>
        <Text style={styles.subtitle}>Добро пожаловать!</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#888"
            editable={!isLoading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#888"
              editable={!isLoading}
              
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={togglePasswordVisibility}
              disabled={isLoading}
            >
              <Ionicons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.registerButton, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>Нет аккаунта? Зарегистрироваться</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleForgotPassword} 
            style={styles.forgotPasswordButton}
            disabled={isLoading}
          >
            <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: theme.background,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: theme.text,
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    width: '70%',
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
  registerButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.accent,
  },
  registerButtonText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: 'bold',
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
  forgotPasswordButton: {
    alignSelf: 'center', 
    marginBottom: 20,
    marginTop: 5, 
  },
  forgotPasswordText: {
    color: theme.textSecondary,
    fontSize: 16,
    textDecorationLine: 'underline', 
  },
});