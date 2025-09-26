import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';

export default function MainScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/'); 
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Добро пожаловать в OnlineCinema!</Text>
      
      <View style={styles.userInfo}>
        <Text style={styles.userText}>Email: {user?.email}</Text>
        <Text style={styles.userText}>Имя: {user?.username}</Text>
        <Text style={styles.userText}>Страна: {user?.country || 'Не указана'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Выйти</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  userInfo: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    width: '100%',
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#e50914',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});