import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAuth } from './context/AuthContext';


export default function WelcomeScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { login, isLoading } = useAuth();

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    try {
      await login(email, password);
      router.replace('/main');
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Произошла ошибка при авторизации');
    }
  };

    const handleRegister = (): void => {
    router.push('/register'); // ИЗМЕНЕНО: навигация через expo-router
  };


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
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
          editable={!isLoading}
        />

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
          <Text style={styles.registerButtonText}>Зарегистрироваться</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: 'black',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 5,
  },
  apiHint: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 5,
  },
  form: {
    width: '70%',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e50914',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e50914',
  },
  registerButtonText: {
    color: '#e50914',
    fontSize: 16,
    fontWeight: 'bold',
  },
});