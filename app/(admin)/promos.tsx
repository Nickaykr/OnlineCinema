import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function AdminPromos() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.text, { color: theme.text }]}>Промокоды</Text>
      <Text style={{ color: '#888', marginTop: 10 }}>Здесь мы будем генерировать скидки</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, fontWeight: 'bold' }
});