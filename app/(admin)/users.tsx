import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminUsers() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Управление пользователями</Text>
      <Text style={{ color: '#888', marginTop: 10 }}>Графики и цифры скоро будут здесь</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});