import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import Header from '../src/components/Header';
import SideMenu from '../src/components/SideMenu';
import { useTheme } from '../src/context/ThemeContext';
import { CommunityRule, moderationAPI } from '../src/services/api'; // подставь свой импорт API

export default function RulesScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const [rules, setRules] = useState<CommunityRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const data = await moderationAPI.getRules(); // временная заглушка метода
        setRules(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке правил платформы:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRules();
  }, []);

  const renderRuleItem = ({ item, index }: { item: CommunityRule; index: number }) => (
    <View style={styles.ruleCard}>
      <View style={styles.ruleHeader}>
        <Text style={styles.ruleNumber}>{index + 1}.</Text>
        <Text style={styles.ruleTitle}>{item.title}</Text>
      </View>
      <Text style={styles.ruleContent}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF3B30" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Правила платформы" onMenuPress={() => setIsMenuVisible(true)} />
      
      <FlatList
        data={rules}
        renderItem={renderRuleItem}
        keyExtractor={(item) => item.rules_id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Правила ИС временно недоступны</Text>
        }
      />

      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </View>
  );
}



const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background || '#121212',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 56,
    padding: 16,
    paddingBottom: 40,
  },
  ruleCard: {
    backgroundColor: theme.cardBackground || '#1E1E1E',
    borderRadius: 8,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30', // Выделяем пункты красивой красной полосой
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginRight: 6,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text || '#FFFFFF',
    flex: 1,
  },
  ruleContent: {
    fontSize: 14,
    color: theme.textSecondary || '#AAAAAA',
    lineHeight: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
    fontSize: 16,
  }
});